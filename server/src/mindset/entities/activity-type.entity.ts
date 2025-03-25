import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { ActivityRecord } from "./activity-record.entity";

/**
 * 활동 유형 엔티티
 * 사용자가 정의하거나 기본으로 제공되는 활동 유형을 나타냄
 */
@Entity("activity_types")
export class ActivityType {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @OneToMany(
    () => ActivityRecord,
    (activityRecord) => activityRecord.activityType,
  )
  activityRecords: ActivityRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
