import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { toast } from "react-toastify";
import { useMindset } from "../contexts/useMindset";

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canTakeTest, refreshTestStatus } = useMindset();

  const handleNonAuthNavigation = useCallback(
    (
      e: React.MouseEvent<HTMLAnchorElement>,
      _path: string,
      featureName: string,
    ) => {
      if (!user) {
        e.preventDefault();
        toast.info(`${featureName} 기능을 이용하시려면 로그인이 필요합니다.`, {
          position: "top-right",
          autoClose: 3000,
          toastId: "login-required",
        });
        navigate("/login");
      }
    },
    [user, navigate],
  );

  // 마인드셋 테스트 페이지로 이동하는 핸들러
  const handleMindsetNavigation = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      if (!user) {
        handleNonAuthNavigation(e, "/mindset", "마인드셋 테스트");
        return;
      }

      try {
        // 테스트 가능 여부 상태 갱신
        await refreshTestStatus();

        if (!canTakeTest) {
          // 테스트 불가능하면 바로 히스토리 페이지로 이동
          navigate("/mindset/history", { replace: true });
        } else {
          // 테스트 가능한 경우 테스트 페이지로 이동
          navigate("/mindset");
        }
      } catch (error) {
        console.error("테스트 가능 여부 확인 실패:", error);
        navigate("/"); // 에러 발생 시 기본 페이지로 이동
      }
    },
    [user, canTakeTest, refreshTestStatus, navigate, handleNonAuthNavigation],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block break-keep">당신의 잠재력을</span>
          <span className="block text-blue-600 break-keep">깨워보세요</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl break-keep">
          자기 계발의 첫 걸음은 자신을 이해하는 것부터 시작됩니다. 우리의 자기
          진단 테스트와 시간 기록 도구를 통해 당신의 현재 상태를 파악하고, 더
          나은 미래를 위한 첫 걸음을 내딛어보세요.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          {user ? (
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Link
                to="/mindset"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-8"
                onClick={handleMindsetNavigation}
              >
                진단 테스트 시작
              </Link>
              <Link
                to="/timetracking"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-8"
              >
                시간 기록 시작
              </Link>
            </div>
          ) : (
            <div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                시작하기
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-12">
          5단계 자기계발 시스템
        </h2>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                  1단계: 마인드셋 전환
                </h3>
                <p className="mt-5 text-base text-gray-500 break-keep">
                  자신의 현재 상태를 정확히 파악하고, 게으름의 원인을 찾아
                  긍정적인 마인드셋으로 전환하는 첫 걸음을 시작하세요.
                </p>
                {user ? (
                  <Link
                    to="/mindset"
                    className="mt-4 inline-block text-blue-500 hover:text-blue-600"
                    onClick={handleMindsetNavigation}
                  >
                    마인드셋 테스트 하기 &rarr;
                  </Link>
                ) : (
                  <Link
                    to="/mindset"
                    className="mt-4 inline-block text-blue-500 hover:text-blue-600"
                    onClick={(e) =>
                      handleNonAuthNavigation(e, "/mindset", "마인드셋 테스트")
                    }
                  >
                    마인드셋 테스트 하기 &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                  2단계: 나를 관찰해라
                </h3>
                <p className="mt-5 text-base text-gray-500 break-keep">
                  효율적인 시간 관리를 통해 더 많은 것을 성취할 수 있습니다.
                  당신의 시간 사용 패턴을 기록하고 분석하여 개선해보세요.
                </p>
                {user ? (
                  <Link
                    to="/timetracking"
                    className="mt-4 inline-block text-green-500 hover:text-green-600"
                  >
                    시간 기록 시작하기 &rarr;
                  </Link>
                ) : (
                  <Link
                    to="/timetracking"
                    className="mt-4 inline-block text-green-500 hover:text-green-600"
                    onClick={(e) =>
                      handleNonAuthNavigation(e, "/timetracking", "시간 기록")
                    }
                  >
                    시간 기록 시작하기 &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-purple-500 rounded-md shadow-lg">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                  3단계: 의지와 환경은 세트다
                </h3>
                <p className="mt-5 text-base text-gray-500 break-keep">
                  주의를 분산시키는 요소를 제거하고 집중력을 높이는 환경을
                  조성하세요. 작은 습관 개선이 큰 변화를 만듭니다.
                </p>
                <span className="mt-4 inline-block text-gray-400">
                  준비 중입니다
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-yellow-500 rounded-md shadow-lg">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                  4단계: 정확한 목표를 만들어라
                </h3>
                <p className="mt-5 text-base text-gray-500 break-keep">
                  SMART 목표 설정 방법론을 통해 구체적이고 측정 가능한 목표를
                  세우고 달성 가능한 계획을 수립하세요.
                </p>
                <span className="mt-4 inline-block text-gray-400">
                  준비 중입니다
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-red-500 rounded-md shadow-lg">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                  5단계: 목표를 단순화해라
                </h3>
                <p className="mt-5 text-base text-gray-500 break-keep">
                  큰 목표를 작은 하위 목표로 분해하고, 매일 달성 가능한 작은
                  성과를 쌓아가며 성취감을 키워보세요.
                </p>
                <span className="mt-4 inline-block text-gray-400">
                  준비 중입니다
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
