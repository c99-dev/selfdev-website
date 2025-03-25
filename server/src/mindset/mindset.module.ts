import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SelfTest } from "./entities/self-test.entity";
import { ActivityType } from "./entities/activity-type.entity";
import { ActivityRecord } from "./entities/activity-record.entity";
import { MindsetService } from "./mindset.service";
import { ActivityService } from "./activity.service";
import { MindsetController } from "./mindset.controller";
import { ActivityController } from "./activity.controller";

@Module({
  imports: [TypeOrmModule.forFeature([SelfTest, ActivityType, ActivityRecord])],
  providers: [MindsetService, ActivityService],
  controllers: [MindsetController, ActivityController],
  exports: [MindsetService, ActivityService],
})
export class MindsetModule {}
