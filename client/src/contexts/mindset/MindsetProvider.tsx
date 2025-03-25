import React, { useState, ReactNode, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../services/apiClient";
import { MindsetContext, TestResult, TestHistoryItem } from "./MindsetContext";

export const MindsetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestHistoryItem[] | null>(
    null,
  );
  const [canTakeTest, setCanTakeTest] = useState(true);

  // 토스트 표시 상태를 추적하는 ref
  const toastShownRef = useRef<boolean>(false);

  const takeTest = useCallback(async (answers: Record<string, number>) => {
    setLoading(true);
    try {
      const response = await api.post("/mindset/self-test", { answers });
      setTestResult(response.data);
      toast.success("테스트가 성공적으로 제출되었습니다.", {
        toastId: "test-submit-success",
      });
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const message = (error.response as { data?: { message?: string } })
          ?.data?.message;
        if (message) {
          toast.error(message, { toastId: "test-error" });
        }
      }
      console.error("테스트 제출 실패", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTestHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/mindset/self-test/history");
      setTestHistory(response.data);
    } catch (error) {
      console.error("테스트 기록 조회 실패", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTestStatus = useCallback(async () => {
    try {
      const response = await api.get("/mindset/self-test/can-take");
      const canTake = response.data.canTake;

      // 이전 상태와 다를 때만 업데이트
      setCanTakeTest((prev) => {
        if (prev !== canTake) {
          return canTake;
        }
        return prev;
      });

      // 테스트 불가능하고 아직 토스트가 표시되지 않은 경우에만 메시지 표시
      if (!canTake && !toastShownRef.current) {
        const nextAvailableDate = new Date(
          response.data.nextAvailableDate,
        ).toLocaleDateString("ko-KR");
        toast.info(
          `이미 테스트를 진행하셨습니다. 다음 테스트는 ${nextAvailableDate}에 가능합니다.`,
          {
            toastId: "test-availability",
            onClose: () => {
              // 토스트가 닫힐 때 ref 초기화
              toastShownRef.current = false;
            },
          },
        );
        toastShownRef.current = true;
      }
    } catch (error) {
      console.error("테스트 상태 갱신 실패", error);
    }
  }, []);

  return (
    <MindsetContext.Provider
      value={{
        loading,
        testResult,
        testHistory,
        takeTest,
        fetchTestHistory,
        canTakeTest,
        setCanTakeTest,
        refreshTestStatus,
      }}
    >
      {children}
    </MindsetContext.Provider>
  );
};
