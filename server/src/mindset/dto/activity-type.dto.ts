import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * 활동 유형 생성을 위한 DTO
 */
export class CreateActivityTypeDto {
  @IsNotEmpty({ message: "활동 유형 이름은 필수입니다." })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

/**
 * 활동 유형 수정을 위한 DTO
 */
export class UpdateActivityTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
