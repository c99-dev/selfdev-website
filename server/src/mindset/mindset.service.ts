import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SelfTest } from "./entities/self-test.entity";
import { TakeSelfTestDto } from "./dto/take-self-test.dto";

// Define proper type for test answers
interface TestAnswers {
  socialMediaUsage: number;
  procrastination: number;
  focusTime: number;
  distractions: string[];
  productiveHours: number;
  sleepSchedule: {
    bedtime: string;
    wakeupTime: string;
  };
}

@Injectable()
export class MindsetService {
  constructor(
    @InjectRepository(SelfTest)
    private selfTestRepository: Repository<SelfTest>,
  ) {}

  async canTakeTest(
    userId: string,
  ): Promise<{ canTake: boolean; nextAvailableDate?: Date }> {
    const lastTest = await this.selfTestRepository.findOne({
      where: { userId },
      order: { takenAt: "DESC" },
    });

    if (!lastTest) {
      return { canTake: true };
    }

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const canTake = lastTest.takenAt < oneDayAgo;

    if (!canTake) {
      const nextAvailableDate = new Date(lastTest.takenAt);
      nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
      return { canTake, nextAvailableDate };
    }

    return { canTake };
  }

  async takeSelfTest(
    userId: string,
    testDto: TakeSelfTestDto,
  ): Promise<SelfTest> {
    const { canTake, nextAvailableDate } = await this.canTakeTest(userId);
    if (!canTake) {
      throw new BadRequestException(
        `이미 테스트를 진행하셨습니다. 다음 테스트는 ${nextAvailableDate?.toLocaleDateString(
          "ko-KR",
        )} 에 가능합니다. 하루에 한 번만 테스트가 가능합니다.`,
      );
    }

    const score = this.calculateScore(testDto.answers);
    const feedback = this.generateFeedback(score, testDto.answers);

    const selfTest = this.selfTestRepository.create({
      userId,
      score,
      answers: testDto.answers,
      feedback,
      isCompleted: true,
    });

    return this.selfTestRepository.save(selfTest);
  }

  private calculateScore(answers: TestAnswers): number {
    let score = 100;

    // SNS 사용 시간에 따른 감점
    score -= Math.min(50, answers.socialMediaUsage * 5);

    // 미루는 정도에 따른 감점
    score -= (answers.procrastination - 1) * 10;

    // 집중 시간에 따른 가점
    score += Math.min(20, answers.focusTime / 30);

    // 생산적 활동 시간에 따른 가점
    score += Math.min(30, answers.productiveHours * 5);

    // 최종 점수 범위 조정
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private generateFeedback(score: number, answers: TestAnswers): string {
    if (score <= 50) {
      return this.generateLowScoreFeedback(answers);
    } else if (score <= 80) {
      return this.generateMediumScoreFeedback(answers);
    } else {
      return this.generateHighScoreFeedback();
    }
  }

  private generateLowScoreFeedback(answers: TestAnswers): string {
    const feedbacks = [
      `하루 ${answers.socialMediaUsage}시간의 SNS 사용은 많은 시간을 소비하고 있습니다. SNS 사용 시간을 절반으로 줄이는 것을 목표로 해보세요.`,
      "주의를 분산시키는 요소들을 제거하고, 집중할 수 있는 환경을 만드는 것이 중요합니다.",
      "작은 목표부터 시작하여 성취감을 느껴보세요. 점진적인 개선이 중요합니다.",
    ];
    return feedbacks.join("\n\n");
  }

  private generateMediumScoreFeedback(answers: TestAnswers): string {
    const feedbacks = [
      "현재의 습관을 유지하면서, 조금 더 개선할 수 있는 부분을 찾아보세요.",
      `하루 ${answers.focusTime}분의 집중 시간은 좋은 출발점입니다. 이를 조금씩 늘려보세요.`,
      "규칙적인 생활 패턴을 만드는 것이 더 나은 결과를 가져올 수 있습니다.",
    ];
    return feedbacks.join("\n\n");
  }

  private generateHighScoreFeedback(): string {
    const feedbacks = [
      "현재의 좋은 습관을 잘 유지하고 있습니다.",
      "다른 사람들과 경험을 공유하여 긍정적인 영향을 줄 수 있습니다.",
      "현재 습관을 더욱 발전시키고, 새로운 도전을 시도해보세요.",
    ];
    return feedbacks.join("\n\n");
  }

  async getUserTestHistory(userId: string): Promise<SelfTest[]> {
    return this.selfTestRepository.find({
      where: { userId },
      order: { takenAt: "DESC" },
    });
  }
}
