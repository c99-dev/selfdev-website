import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
  Put,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ActivityService } from "./activity.service";
import {
  CreateActivityTypeDto,
  UpdateActivityTypeDto,
} from "./dto/activity-type.dto";
import {
  CreateActivityRecordDto,
  FilterActivityRecordsDto,
} from "./dto/activity-record.dto";

// 인증된 사용자 요청 인터페이스
interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller("mindset/activity")
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  // 활동 유형 관련 API
  @Get("types")
  async getActivityTypes(@Request() req: RequestWithUser) {
    return this.activityService.getActivityTypes(req.user.id);
  }

  @Post("types")
  async createActivityType(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateActivityTypeDto,
  ) {
    return this.activityService.createActivityType(req.user.id, createDto);
  }

  @Put("types/:id")
  async updateActivityType(
    @Request() req: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateActivityTypeDto,
  ) {
    return this.activityService.updateActivityType(id, req.user.id, updateDto);
  }

  @Delete("types/:id")
  async deleteActivityType(
    @Request() req: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.activityService.deleteActivityType(id, req.user.id);
  }

  // 활동 기록 관련 API
  @Post("records")
  async createActivityRecord(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateActivityRecordDto,
  ) {
    return this.activityService.createActivityRecord(req.user.id, createDto);
  }

  @Get("records")
  async getActivityRecords(
    @Request() req: RequestWithUser,
    @Query() filterDto: FilterActivityRecordsDto,
  ) {
    return this.activityService.getActivityRecords(req.user.id, filterDto);
  }

  @Delete("records/:id")
  async deleteActivityRecord(
    @Request() req: RequestWithUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.activityService.deleteActivityRecord(id, req.user.id);
  }

  // 활동 분석 API
  @Get("analyze")
  async analyzeTimeUsage(
    @Request() req: RequestWithUser,
    @Query("startDate") startDateString: string,
    @Query("endDate") endDateString: string,
  ) {
    const startDate = startDateString ? new Date(startDateString) : new Date();
    startDate.setDate(startDate.getDate() - 7); // 기본값: 7일 전

    const endDate = endDateString ? new Date(endDateString) : new Date();

    return this.activityService.analyzeTimeUsage(
      req.user.id,
      startDate,
      endDate,
    );
  }
}
