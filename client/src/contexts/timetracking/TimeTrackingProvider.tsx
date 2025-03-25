import React, { useState, ReactNode, useCallback } from "react";
import api from "../../services/apiClient";
import { toast } from "react-toastify";
import {
  TimeTrackingContext,
  ActivityType,
  ActivityRecord,
  TimeAnalytics,
} from "./TimeTrackingContext";

interface ActivityRecordResponse {
  id: string;
  activityTypeId: string;
  startTime: string;
  endTime: string;
  note?: string;
  activityType?: ActivityType;
}

interface TimeTrackingProviderProps {
  children: ReactNode;
}

export const TimeTrackingProvider: React.FC<TimeTrackingProviderProps> = ({
  children,
}) => {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivityTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/mindset/activity/types");
      setActivityTypes(response.data);
    } catch (error) {
      console.error("활동 유형 조회 실패:", error);
      toast.error("활동 유형을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createActivityType = useCallback(
    async (name: string, color: string, icon: string) => {
      setIsLoading(true);
      try {
        const response = await api.post("/mindset/activity/types", {
          name,
          color,
          icon,
        });
        setActivityTypes((prev) => [...prev, response.data]);
        toast.success("활동 유형이 추가되었습니다.");
      } catch (error) {
        console.error("활동 유형 생성 실패:", error);
        toast.error("활동 유형 추가에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateActivityType = useCallback(
    async (id: string, name: string, color: string, icon: string) => {
      setIsLoading(true);
      try {
        const response = await api.put(`/mindset/activity/types/${id}`, {
          name,
          color,
          icon,
        });
        setActivityTypes((prev) =>
          prev.map((type) => (type.id === id ? response.data : type)),
        );
        toast.success("활동 유형이 수정되었습니다.");
      } catch (error) {
        console.error("활동 유형 수정 실패:", error);
        toast.error("활동 유형 수정에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteActivityType = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/mindset/activity/types/${id}`);
      setActivityTypes((prev) => prev.filter((type) => type.id !== id));
      toast.success("활동 유형이 삭제되었습니다.");
    } catch (error) {
      console.error("활동 유형 삭제 실패:", error);
      toast.error("활동 유형 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActivityRecords = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      setIsLoading(true);
      try {
        let url = "/mindset/activity/records";
        const params: Record<string, string> = {};

        if (startDate) {
          params.startDate = startDate.toISOString();
        }
        if (endDate) {
          params.endDate = endDate.toISOString();
        }

        // URL 파라미터 추가
        if (Object.keys(params).length > 0) {
          const queryString = new URLSearchParams(params).toString();
          url = `${url}?${queryString}`;
        }

        const response = await api.get<ActivityRecordResponse[]>(url);

        // ISO 날짜 문자열을 Date 객체로 변환
        const recordsWithDates = response.data.map(
          (record: ActivityRecordResponse) => ({
            ...record,
            startTime: new Date(record.startTime),
            endTime: new Date(record.endTime),
          }),
        );

        setActivityRecords(recordsWithDates);
      } catch (error) {
        console.error("활동 기록 조회 실패:", error);
        toast.error("활동 기록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const createActivityRecord = useCallback(
    async (
      activityTypeId: string,
      startTime: Date,
      endTime: Date,
      note?: string,
    ) => {
      setIsLoading(true);
      try {
        const response = await api.post<ActivityRecordResponse>(
          "/mindset/activity/records",
          {
            activityTypeId,
            startTime,
            endTime,
            note,
          },
        );

        // 새로 생성된 기록에 startTime, endTime을 Date로 파싱
        const newRecord = {
          ...response.data,
          startTime: new Date(response.data.startTime),
          endTime: new Date(response.data.endTime),
        };

        setActivityRecords((prev) => [newRecord, ...prev]);
        toast.success("활동 기록이 추가되었습니다.");
      } catch (error) {
        console.error("활동 기록 생성 실패:", error);
        toast.error("활동 기록 추가에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteActivityRecord = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/mindset/activity/records/${id}`);
      setActivityRecords((prev) => prev.filter((record) => record.id !== id));
      toast.success("활동 기록이 삭제되었습니다.");
    } catch (error) {
      console.error("활동 기록 삭제 실패:", error);
      toast.error("활동 기록 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTimeAnalytics = useCallback(
    async (startDate?: Date, endDate?: Date): Promise<TimeAnalytics> => {
      setIsLoading(true);
      try {
        let url = "/mindset/activity/analyze";
        const params: Record<string, string> = {};

        if (startDate) {
          params.startDate = startDate.toISOString();
        }
        if (endDate) {
          params.endDate = endDate.toISOString();
        }

        // URL 파라미터 추가
        if (Object.keys(params).length > 0) {
          const queryString = new URLSearchParams(params).toString();
          url = `${url}?${queryString}`;
        }

        const response = await api.get<TimeAnalytics>(url);
        return response.data;
      } catch (error) {
        console.error("시간 활용 분석 실패:", error);
        toast.error("시간 활용 분석에 실패했습니다.");
        // 에러 시 빈 분석 데이터 반환
        return {
          timeByActivity: [],
          summary: {
            totalRecordedMinutes: 0,
            totalRecordedHours: 0,
            leisureMinutes: 0,
            leisurePercentage: 0,
            daysInRange: 0,
          },
          suggestions: ["데이터를 불러오는데 실패했습니다."],
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const value = {
    activityTypes,
    activityRecords,
    isLoading,
    fetchActivityTypes,
    createActivityType,
    updateActivityType,
    deleteActivityType,
    fetchActivityRecords,
    createActivityRecord,
    deleteActivityRecord,
    getTimeAnalytics,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};
