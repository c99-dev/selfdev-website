import { createContext } from "react";

export interface ActivityType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface ActivityRecord {
  id: string;
  activityTypeId: string;
  startTime: Date;
  endTime: Date;
  note?: string;
  activityType?: ActivityType;
}

export interface TimeAnalytics {
  timeByActivity: {
    id: string;
    name: string;
    color: string;
    totalMinutes: number;
    totalHours: number;
  }[];
  summary: {
    totalRecordedMinutes: number;
    totalRecordedHours: number;
    leisureMinutes: number;
    leisurePercentage: number;
    daysInRange: number;
  };
  suggestions: string[];
}

export interface TimeTrackingContextType {
  activityTypes: ActivityType[];
  activityRecords: ActivityRecord[];
  isLoading: boolean;
  fetchActivityTypes: () => Promise<void>;
  createActivityType: (
    name: string,
    color: string,
    icon: string,
  ) => Promise<void>;
  updateActivityType: (
    id: string,
    name: string,
    color: string,
    icon: string,
  ) => Promise<void>;
  deleteActivityType: (id: string) => Promise<void>;
  fetchActivityRecords: (startDate?: Date, endDate?: Date) => Promise<void>;
  createActivityRecord: (
    activityTypeId: string,
    startTime: Date,
    endTime: Date,
    note?: string,
  ) => Promise<void>;
  deleteActivityRecord: (id: string) => Promise<void>;
  getTimeAnalytics: (
    startDate?: Date,
    endDate?: Date,
  ) => Promise<TimeAnalytics>;
}

export const TimeTrackingContext = createContext<
  TimeTrackingContextType | undefined
>(undefined);
