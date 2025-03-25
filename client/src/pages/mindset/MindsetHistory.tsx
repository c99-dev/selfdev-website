import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/apiClient";
import { useMindset } from "../../contexts/useMindset";
import { toast } from "react-toastify";
import LoadingIndicator from "../../components/LoadingIndicator";

interface TestResult {
  id: string;
  score: number;
  feedback: string;
  answers: {
    socialMediaUsage: number;
    procrastination: number;
    focusTime: number;
    distractions: string[];
    productiveHours: number;
    sleepSchedule: {
      bedtime: string;
      wakeupTime: string;
    };
  };
  takenAt: string;
}

const TestResultItem = React.memo(({ result }: { result: TestResult }) => (
  <div key={result.id} className="bg-white shadow-lg rounded-lg p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-semibold">테스트 점수: {result.score}점</h3>
        <p className="text-gray-500">
          {new Date(result.takenAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="flex items-center">
        <div
          className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
            result.score >= 80
              ? "bg-green-500"
              : result.score >= 50
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        >
          {result.score}
        </div>
      </div>
    </div>

    <div className="mt-4">
      <h4 className="font-semibold mb-2">피드백</h4>
      <p className="text-gray-700 whitespace-pre-line">{result.feedback}</p>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold mb-2">활동 패턴</h4>
        <ul className="space-y-2 text-gray-700">
          <li>SNS 사용: {result.answers.socialMediaUsage}시간/일</li>
          <li>미루기 정도: {result.answers.procrastination}/5</li>
          <li>집중 시간: {result.answers.focusTime}분</li>
          <li>생산적 활동: {result.answers.productiveHours}시간/일</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">주의 분산 요소</h4>
        <div className="flex flex-wrap gap-2">
          {result.answers.distractions.map((distraction) => (
            <span
              key={distraction}
              className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700"
            >
              {distraction}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-4">
      <h4 className="font-semibold mb-2">수면 패턴</h4>
      <p className="text-gray-700">
        취침: {result.answers.sleepSchedule.bedtime} / 기상:{" "}
        {result.answers.sleepSchedule.wakeupTime}
      </p>
    </div>
  </div>
));

const MindsetHistory: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextTestDate, setNextTestDate] = useState<string | null>(null);
  const { canTakeTest, setCanTakeTest } = useMindset();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchTestHistory = useCallback(async () => {
    setLoading(true);
    try {
      console.log("테스트 기록 로딩 중...");
      const response = await api.get("/mindset/self-test/history");
      console.log("테스트 기록 로드 완료:", response.data);
      setTestResults(response.data);
    } catch (error) {
      console.error("테스트 기록 조회 실패:", error);
      toast.error("테스트 기록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkNextTestDate = useCallback(async () => {
    try {
      console.log("테스트 가능 여부 확인 중...");
      const response = await api.get("/mindset/self-test/can-take");
      console.log("테스트 가능 여부:", response.data);

      // 컨텍스트 상태 업데이트
      if (setCanTakeTest) {
        setCanTakeTest(response.data.canTake);
      }

      if (!response.data.canTake && response.data.nextAvailableDate) {
        // API에서 직접 다음 가능 날짜 정보 사용
        setNextTestDate(
          new Date(response.data.nextAvailableDate).toLocaleDateString("ko-KR"),
        );
      } else {
        setNextTestDate(null);
      }
    } catch (error) {
      console.error("테스트 가능 여부 확인 실패:", error);
    }
  }, [setCanTakeTest]);

  // 컴포넌트 마운트 또는 location 변경 시 데이터 새로고침
  useEffect(() => {
    const loadData = async () => {
      await fetchTestHistory();
      await checkNextTestDate();
    };

    loadData();

    // location의 state에서 API 에러 메시지 자동으로 표시됨
    // 추가 토스트 메시지 표시가 필요 없음

    // 디버깅용 정보
    console.log("MindsetHistory 마운트/업데이트됨, 경로:", location.pathname);
  }, [fetchTestHistory, checkNextTestDate, location, navigate]);

  // "새 테스트 시작" 버튼 클릭 핸들러
  const handleStartTest = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // 테스트를 진행할 수 없는 상태라면 이벤트 중단
      if (!canTakeTest) {
        e.preventDefault();
      }
    },
    [canTakeTest],
  );

  // 테스트 가능 여부에 따른 버튼/상태 메시지 메모이제이션
  const testActionElement = useMemo(
    () =>
      canTakeTest ? (
        <Link
          to="/mindset"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleStartTest}
        >
          새 테스트 시작
        </Link>
      ) : (
        nextTestDate && (
          <div className="text-gray-600">
            다음 테스트 가능 날짜: {nextTestDate}
          </div>
        )
      ),
    [canTakeTest, nextTestDate, handleStartTest],
  );

  // 테스트 결과 목록 렌더링을 메모이제이션
  const testResultsList = useMemo(() => {
    if (testResults.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">아직 테스트 기록이 없습니다.</p>
          {canTakeTest && (
            <Link
              to="/mindset"
              className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              onClick={handleStartTest}
            >
              첫 테스트 시작하기
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {testResults.map((result) => (
          <TestResultItem key={result.id} result={result} />
        ))}
      </div>
    );
  }, [testResults, canTakeTest, handleStartTest]);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">마인드셋 테스트 기록</h2>
        {testActionElement}
      </div>

      {testResultsList}
    </div>
  );
};

export default React.memo(MindsetHistory);
