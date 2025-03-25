import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { ActivityType } from "./activity-type.entity";

/**
 * 활동 기록 엔티티
 * 사용자가 특정 시간에 기록한 활동 정보를 저장
 */
@Entity("activity_records")
export class ActivityRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  activityTypeId: string;

  @ManyToOne(() => ActivityType, (activityType) => activityType.activityRecords)
  activityType: ActivityType;

  @Column("timestamp")
  startTime: Date;

  @Column("timestamp")
  endTime: Date;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  recordedAt: Date;
}
