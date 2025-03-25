import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * 활동 기록 생성을 위한 DTO
 */
export class CreateActivityRecordDto {
  @IsNotEmpty({ message: "활동 유형 ID는 필수입니다." })
  @IsUUID()
  activityTypeId: string;

  @IsNotEmpty({ message: "시작 시간은 필수입니다." })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsNotEmpty({ message: "종료 시간은 필수입니다." })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * 활동 기록 필터링을 위한 DTO
 */
export class FilterActivityRecordsDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsUUID()
  activityTypeId?: string;
}
