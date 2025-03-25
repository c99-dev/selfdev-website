import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, FindOptionsWhere } from "typeorm";
import { ActivityType } from "./entities/activity-type.entity";
import { ActivityRecord } from "./entities/activity-record.entity";
import {
  CreateActivityTypeDto,
  UpdateActivityTypeDto,
} from "./dto/activity-type.dto";
import {
  CreateActivityRecordDto,
  FilterActivityRecordsDto,
} from "./dto/activity-record.dto";

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityType)
    private activityTypeRepository: Repository<ActivityType>,
    @InjectRepository(ActivityRecord)
    private activityRecordRepository: Repository<ActivityRecord>,
  ) {
    // 기본 활동 유형 초기화
    void this.initDefaultActivityTypes();
  }

  // 기본 활동 유형 초기화 함수
  private async initDefaultActivityTypes(): Promise<void> {
    const defaultTypes = [
      { name: "업무", icon: "briefcase", color: "#4F46E5", isDefault: true },
      { name: "공부", icon: "book", color: "#059669", isDefault: true },
      { name: "휴식", icon: "coffee", color: "#F59E0B", isDefault: true },
      { name: "수면", icon: "moon", color: "#6366F1", isDefault: true },
      { name: "운동", icon: "running", color: "#EF4444", isDefault: true },
      { name: "식사", icon: "utensils", color: "#10B981", isDefault: true },
      { name: "SNS", icon: "hashtag", color: "#3B82F6", isDefault: true },
      { name: "이동", icon: "car", color: "#8B5CF6", isDefault: true },
      { name: "집안일", icon: "home", color: "#EC4899", isDefault: true },
      { name: "여가활동", icon: "gamepad", color: "#F97316", isDefault: true },
    ];

    // 기본 유형이 있는지 확인하고 없으면 추가
    for (const type of defaultTypes) {
      const exists = await this.activityTypeRepository.findOne({
        where: { name: type.name, isDefault: true },
      });

      if (!exists) {
        await this.activityTypeRepository.save(type);
      }
    }
  }

  // 활동 유형 관리 함수들
  async getActivityTypes(userId?: string): Promise<ActivityType[]> {
    // 기본 활동 유형과 사용자 생성 활동 유형을 함께 반환
    if (userId) {
      return this.activityTypeRepository.find({
        where: [{ isDefault: true }, { userId }],
        order: { createdAt: "ASC" },
      });
    } else {
      return this.activityTypeRepository.find({
        where: { isDefault: true },
        order: { createdAt: "ASC" },
      });
    }
  }

  async createActivityType(
    userId: string,
    createDto: CreateActivityTypeDto,
  ): Promise<ActivityType> {
    const activityType = this.activityTypeRepository.create({
      ...createDto,
      userId,
    });
    return this.activityTypeRepository.save(activityType);
  }

  async updateActivityType(
    id: string,
    userId: string,
    updateDto: UpdateActivityTypeDto,
  ): Promise<ActivityType> {
    const activityType = await this.activityTypeRepository.findOne({
      where: { id, userId },
    });

    if (!activityType) {
      throw new NotFoundException("활동 유형을 찾을 수 없습니다.");
    }

    // 기본 활동 유형은 수정 불가
    if (activityType.isDefault) {
      throw new NotFoundException("기본 활동 유형은 수정할 수 없습니다.");
    }

    return this.activityTypeRepository.save({
      ...activityType,
      ...updateDto,
    });
  }

  async deleteActivityType(
    id: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const activityType = await this.activityTypeRepository.findOne({
      where: { id, userId },
    });

    if (!activityType) {
      throw new NotFoundException("활동 유형을 찾을 수 없습니다.");
    }

    // 기본 활동 유형은 삭제 불가
    if (activityType.isDefault) {
      throw new NotFoundException("기본 활동 유형은 삭제할 수 없습니다.");
    }

    // 활동 유형과 연결된 기록이 있는지 확인
    const hasRecords = await this.activityRecordRepository.findOne({
      where: { activityTypeId: id },
    });

    if (hasRecords) {
      throw new NotFoundException(
        "이 활동 유형에 연결된 기록이 있어 삭제할 수 없습니다.",
      );
    }

    await this.activityTypeRepository.remove(activityType);
    return { success: true };
  }

  // 활동 기록 관리 함수들
  async createActivityRecord(
    userId: string,
    createDto: CreateActivityRecordDto,
  ): Promise<ActivityRecord> {
    // 활동 유형이 존재하는지 확인
    const activityType = await this.activityTypeRepository.findOne({
      where: [
        { id: createDto.activityTypeId, isDefault: true },
        { id: createDto.activityTypeId, userId },
      ],
    });

    if (!activityType) {
      throw new NotFoundException("활동 유형을 찾을 수 없습니다.");
    }

    const activityRecord = this.activityRecordRepository.create({
      ...createDto,
      userId,
    });

    return this.activityRecordRepository.save(activityRecord);
  }

  async getActivityRecords(
    userId: string,
    filterDto: FilterActivityRecordsDto,
  ): Promise<ActivityRecord[]> {
    const { startDate, endDate, activityTypeId } = filterDto;

    // 기본 조건은 사용자 ID
    const whereConditions: FindOptionsWhere<ActivityRecord> = { userId };

    // 날짜 범위가 지정된 경우
    if (startDate && endDate) {
      whereConditions.startTime = Between(startDate, endDate);
    }

    // 활동 유형이 지정된 경우
    if (activityTypeId) {
      whereConditions.activityTypeId = activityTypeId;
    }

    return this.activityRecordRepository.find({
      where: whereConditions,
      relations: ["activityType"],
      order: { startTime: "DESC" },
    });
  }

  async deleteActivityRecord(
    id: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const activityRecord = await this.activityRecordRepository.findOne({
      where: { id, userId },
    });

    if (!activityRecord) {
      throw new NotFoundException("활동 기록을 찾을 수 없습니다.");
    }

    await this.activityRecordRepository.remove(activityRecord);
    return { success: true };
  }

  // 활동 분석 함수들
  async analyzeTimeUsage(userId: string, startDate: Date, endDate: Date) {
    // 1. 지정된 기간 내 활동 기록 가져오기
    const activityRecords = await this.activityRecordRepository.find({
      where: {
        userId,
        startTime: Between(startDate, endDate),
      },
      relations: ["activityType"],
    });

    // 2. 활동 유형별 총 시간 계산
    const timeByActivityType = new Map<
      string,
      { total: number; name: string; color: string }
    >();

    // 각 활동 기록을 반복하며 활동 유형별 시간 누적
    activityRecords.forEach((record) => {
      const activityTypeId = record.activityTypeId;
      const durationInMinutes =
        (record.endTime.getTime() - record.startTime.getTime()) / (1000 * 60);

      if (!timeByActivityType.has(activityTypeId)) {
        timeByActivityType.set(activityTypeId, {
          total: 0,
          name: record.activityType.name,
          color: record.activityType.color || "#3B82F6",
        });
      }

      const currentData = timeByActivityType.get(activityTypeId);
      if (currentData) {
        currentData.total += durationInMinutes;
      }
    });

    // 3. 결과 변환 및 정렬
    const results = Array.from(timeByActivityType.entries()).map(
      ([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        totalMinutes: Math.round(data.total),
        totalHours: Math.round((data.total / 60) * 10) / 10, // 소수점 첫째 자리까지 표시
      }),
    );

    // 시간 기준 내림차순 정렬
    results.sort((a, b) => b.totalMinutes - a.totalMinutes);

    // 4. 분석 요약 생성
    const totalRecordedMinutes = results.reduce(
      (sum, item) => sum + item.totalMinutes,
      0,
    );
    const totalRecordedHours =
      Math.round((totalRecordedMinutes / 60) * 10) / 10;

    // SNS나 여가활동 같은 지정된 카테고리의 시간 계산
    const leisureCategories = ["SNS", "여가활동", "휴식"];
    const leisureTypes = results.filter((r) =>
      leisureCategories.includes(r.name),
    );
    const totalLeisureMinutes = leisureTypes.reduce(
      (sum, item) => sum + item.totalMinutes,
      0,
    );
    const leisurePercentage =
      totalRecordedMinutes > 0
        ? Math.round((totalLeisureMinutes / totalRecordedMinutes) * 100)
        : 0;

    // 5. 개선 제안 생성
    const suggestions: string[] = [];

    // 총 기록 시간이 하루 활동 시간(16시간)의 50% 미만인 경우
    const expectedDailyMinutes = 16 * 60; // 16시간 (수면 제외)
    const daysInRange = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const expectedTotalMinutes = expectedDailyMinutes * daysInRange;

    if (totalRecordedMinutes < expectedTotalMinutes * 0.5) {
      suggestions.push(
        "더 많은 활동을 기록하면 더 정확한 분석 결과를 얻을 수 있습니다.",
      );
    }

    // 여가 활동 비율이 40% 이상인 경우
    if (leisurePercentage >= 40) {
      suggestions.push(
        `여가 활동에 시간의 ${leisurePercentage}%를 사용하고 있습니다. 생산적인 활동 시간을 늘려보세요.`,
      );
    }

    // 가장 많은 시간을 차지하는 활동 분석
    if (results.length > 0) {
      const topActivity = results[0];
      if (topActivity.totalMinutes > totalRecordedMinutes * 0.5) {
        suggestions.push(
          `${topActivity.name} 활동이 전체 시간의 50% 이상을 차지합니다. 활동을 다양화하는 것이 좋습니다.`,
        );
      }
    }

    // 최종 분석 결과 반환
    return {
      timeByActivity: results,
      summary: {
        totalRecordedMinutes,
        totalRecordedHours,
        leisureMinutes: totalLeisureMinutes,
        leisurePercentage,
        daysInRange,
      },
      suggestions,
    };
  }
}
