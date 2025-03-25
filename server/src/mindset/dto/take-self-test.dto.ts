import { IsNotEmpty, IsObject } from "class-validator";

export class TakeSelfTestDto {
  @IsNotEmpty()
  @IsObject()
  answers: {
    socialMediaUsage: number; // 하루 SNS 사용 시간 (시간)
    procrastination: number; // 미루는 정도 (1-5)
    focusTime: number; // 집중 가능 시간 (분)
    distractions: string[]; // 주의 분산 요소들
    productiveHours: number; // 하루 생산적 활동 시간
    sleepSchedule: {
      bedtime: string; // HH:mm 형식
      wakeupTime: string; // HH:mm 형식
    };
  };
}
