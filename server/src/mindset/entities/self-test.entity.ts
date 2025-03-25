import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

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

@Entity("self_tests")
export class SelfTest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.selfTests)
  user: User;

  @Column()
  userId: string;

  @Column("int")
  score: number;

  @Column("jsonb")
  answers: TestAnswers;

  @Column("text")
  feedback: string;

  @CreateDateColumn()
  takenAt: Date;

  @Column({ default: false })
  isCompleted: boolean;
}
