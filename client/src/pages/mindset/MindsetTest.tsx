import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/apiClient";
import LoadingIndicator from "../../components/LoadingIndicator";
import { useMindset } from "../../contexts/useMindset";

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

const MindsetTest: React.FC = () => {
  const navigate = useNavigate();
  const { canTakeTest, refreshTestStatus } = useMindset();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<TestAnswers>({
    socialMediaUsage: 0,
    procrastination: 3,
    focusTime: 30,
    distractions: [],
    productiveHours: 4,
    sleepSchedule: {
      bedtime: "23:00",
      wakeupTime: "07:00",
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 컴포넌트 마운트 시 테스트 가능 여부 확인
  useEffect(() => {
    let isMounted = true;

    const checkTestAvailability = async () => {
      try {
        await refreshTestStatus();

        // 테스트 불가능한 경우 바로 히스토리 페이지로 이동
        // 에러 메시지는 서버에서 자동으로 처리됨
        if (isMounted && !canTakeTest) {
          navigate("/mindset/history", { replace: true });
        }

        if (isMounted) {
          setInitialLoading(false);
        }
      } catch (error) {
        console.error("테스트 가능 여부 확인 실패:", error);
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    checkTestAvailability();

    return () => {
      isMounted = false;
    };
  }, [refreshTestStatus, navigate, canTakeTest]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/mindset/self-test", { answers });
      toast.success("테스트가 성공적으로 제출되었습니다.");
      navigate("/mindset/history");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string } })?.data
              ?.message || "테스트 제출 실패. 잠시 후 다시 시도해 주세요."
          : "테스트 제출 실패. 잠시 후 다시 시도해 주세요.";
      toast.error(errorMessage);
      console.error("테스트 제출 실패:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting || initialLoading) {
    return <LoadingIndicator />;
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SNS 사용 시간</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                하루 평균 SNS 사용 시간:{" "}
                <span className="font-bold">
                  {answers.socialMediaUsage === 12
                    ? "12시간 이상"
                    : `${answers.socialMediaUsage}시간`}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={answers.socialMediaUsage}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    socialMediaUsage: Number(e.target.value),
                  })
                }
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0시간</span>
                <span>2시간</span>
                <span>4시간</span>
                <span>6시간</span>
                <span>8시간</span>
                <span>10시간</span>
                <span>12시간 이상</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">일 미루기 정도</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                일을 미루는 정도 (1: 전혀 안 미룸 ~ 5: 매우 자주 미룸)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={answers.procrastination}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    procrastination: Number(e.target.value),
                  })
                }
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">집중 시간</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                한 번에 집중할 수 있는 시간:{" "}
                <span className="font-bold">
                  {answers.focusTime === 120
                    ? "120분 이상"
                    : `${answers.focusTime}분`}
                </span>
              </label>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={answers.focusTime}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    focusTime: Number(e.target.value),
                  })
                }
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10분</span>
                <span>30분</span>
                <span>60분</span>
                <span>90분</span>
                <span>120분 이상</span>
              </div>
            </div>
          </div>
        );

      case 4: {
        const distractionOptions = [
          "스마트폰",
          "SNS",
          "TV/동영상",
          "게임",
          "잡담",
          "잦은 휴식",
          "집중력 부족",
        ];

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">주의 분산 요소</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                집중을 방해하는 요소들 (복수 선택 가능)
              </label>
              <div className="mt-2 space-y-2">
                {distractionOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={answers.distractions.includes(option)}
                      onChange={(e) => {
                        const newDistractions = e.target.checked
                          ? [...answers.distractions, option]
                          : answers.distractions.filter(
                              (item) => item !== option,
                            );
                        setAnswers({
                          ...answers,
                          distractions: newDistractions,
                        });
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">생산적 활동 시간</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                하루 평균 생산적 활동 시간:{" "}
                <span className="font-bold">
                  {answers.productiveHours === 12
                    ? "12시간 이상"
                    : `${answers.productiveHours}시간`}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={answers.productiveHours}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    productiveHours: Number(e.target.value),
                  })
                }
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0시간</span>
                <span>2시간</span>
                <span>4시간</span>
                <span>6시간</span>
                <span>8시간</span>
                <span>10시간</span>
                <span>12시간 이상</span>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">수면 스케줄</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  취침 시간
                </label>
                <input
                  type="time"
                  value={answers.sleepSchedule.bedtime}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      sleepSchedule: {
                        ...answers.sleepSchedule,
                        bedtime: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  기상 시간
                </label>
                <input
                  type="time"
                  value={answers.sleepSchedule.wakeupTime}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      sleepSchedule: {
                        ...answers.sleepSchedule,
                        wakeupTime: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">자기 진단 테스트</h2>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>진행률</span>
            <span>{Math.round((step / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {renderStep()}

        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              이전
            </button>
          )}
          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-auto"
            >
              제출하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindsetTest;
