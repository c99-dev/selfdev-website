import React, { useState, useEffect, useCallback } from "react";
import { useTimeTracking } from "../../contexts/useTimeTracking";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import LoadingIndicator from "../../components/LoadingIndicator";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#8B5CF6",
];

// 인터페이스 정의
interface ActivityData {
  id: string;
  name: string;
  color: string;
  totalMinutes: number;
  totalHours: number;
}

interface AnalyticsSummary {
  totalRecordedMinutes: number;
  totalRecordedHours: number;
  leisureMinutes: number;
  leisurePercentage: number;
  daysInRange: number;
}

interface AnalyticsData {
  timeByActivity: ActivityData[];
  summary: AnalyticsSummary;
  suggestions: string[];
}

interface HourlyData {
  name: string;
  [key: string]: string | number;
}

const TimeAnalytics: React.FC = () => {
  const { getTimeAnalytics, isLoading } = useTimeTracking();
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  // 시간대별 활동 분포 데이터 (시간당 활동 유형별 시간)
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);

  // 시간대별 활동 샘플 데이터 생성 (실제로는 백엔드에서 제공해야 함)
  const generateHourlyData = useCallback((activities: ActivityData[]): void => {
    if (!activities || activities.length === 0) return;

    const hourlyData: HourlyData[] = [];

    // 6시부터 24시까지 2시간 단위로 구간 생성
    for (let hour = 6; hour < 24; hour += 2) {
      const timeSlot = `${hour}-${hour + 2}시`;

      const hourData: HourlyData = { name: timeSlot };

      // 각 활동 유형에 대해 랜덤 시간 할당
      activities.forEach((activity) => {
        // 시간대별로 특정 활동이 더 많이 발생하도록 가중치 부여
        let weight = 1;

        // 예: 아침에는 식사, 오전에는 업무/공부, 저녁에는 여가 활동 등에 가중치
        if (hour >= 6 && hour < 10) {
          if (activity.name === "식사" || activity.name === "운동") weight = 3;
        } else if (hour >= 10 && hour < 18) {
          if (activity.name === "업무" || activity.name === "공부") weight = 3;
        } else if (hour >= 18) {
          if (activity.name === "여가활동" || activity.name === "SNS")
            weight = 3;
        }

        // 30분 단위(0~120분)의 값 생성
        const minutes = Math.floor(Math.random() * 4 * weight) * 30;
        hourData[activity.name] = minutes;
      });

      hourlyData.push(hourData);
    }

    setHourlyData(hourlyData);
  }, []);

  const loadAnalytics = useCallback(async (): Promise<void> => {
    setLoadingAnalytics(true);
    try {
      const result = await getTimeAnalytics(startDate, endDate);
      setAnalytics(result);

      // 시간대별 랜덤 데이터 생성 (백엔드에서 실제 데이터를 받아와야 함)
      generateHourlyData(result.timeByActivity);
    } catch (error) {
      console.error("시간 분석 데이터 로딩 실패:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [getTimeAnalytics, startDate, endDate, generateHourlyData]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (): void => {
    if (startDate > endDate) {
      alert("시작일은 종료일보다 이전이어야 합니다.");
      return;
    }
    void loadAnalytics();
  };

  const renderSuggestions = () => {
    if (
      !analytics ||
      !analytics.suggestions ||
      analytics.suggestions.length === 0
    ) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">시간 활용 제안</h2>
        <ul className="list-disc pl-5 space-y-2">
          {analytics.suggestions.map((suggestion: string, index: number) => (
            <li key={index} className="text-gray-700">
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTimeUsageByActivity = () => {
    if (
      !analytics ||
      !analytics.timeByActivity ||
      analytics.timeByActivity.length === 0
    ) {
      return (
        <div className="bg-white rounded-lg p-6 shadow mb-6 text-center">
          <p className="text-gray-500">분석할 데이터가 없습니다.</p>
        </div>
      );
    }

    const pieData = analytics.timeByActivity.map((item) => ({
      name: item.name,
      value: item.totalMinutes,
      color: item.color,
    }));

    return (
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">활동별 시간 사용</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(Number(percent) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `${Math.round((value / 60) * 10) / 10}시간 (${value}분)`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2">
            <div className="space-y-3">
              {analytics.timeByActivity.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        activity.color || COLORS[index % COLORS.length],
                    }}
                  ></span>
                  <span className="font-medium w-24">{activity.name}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${
                          (activity.totalMinutes /
                            analytics.summary.totalRecordedMinutes) *
                          100
                        }%`,
                        backgroundColor:
                          activity.color || COLORS[index % COLORS.length],
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-20 text-right">
                    {activity.totalHours} 시간
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHourlyDistribution = () => {
    if (!hourlyData || hourlyData.length === 0) {
      return null;
    }

    // 차트에 표시할 활동 목록 (최대 5개)
    const activities = Object.keys(hourlyData[0])
      .filter((key) => key !== "name")
      .slice(0, 5);

    return (
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">시간대별 활동 분포</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{ value: "분", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={(value: number) => `${value}분`} />
              <Legend />
              {activities.map((activity, index) => (
                <Bar
                  key={activity}
                  dataKey={activity}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          (시간대별 데이터는 예시입니다)
        </p>
      </div>
    );
  };

  const renderSummary = () => {
    if (!analytics || !analytics.summary) {
      return null;
    }

    const { summary } = analytics;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h2 className="text-3xl font-bold text-blue-600">
            {summary.totalRecordedHours}
          </h2>
          <p className="text-gray-700">총 기록 시간 (시간)</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h2 className="text-3xl font-bold text-green-600">
            {summary.daysInRange}
          </h2>
          <p className="text-gray-700">분석 기간 (일)</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h2 className="text-3xl font-bold text-orange-600">
            {summary.leisurePercentage}%
          </h2>
          <p className="text-gray-700">여가 활동 비율</p>
        </div>
      </div>
    );
  };

  if (isLoading || loadingAnalytics) {
    return <LoadingIndicator />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">시간 분석</h1>
        <Link
          to="/timetracking"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          시간 기록하기
        </Link>
      </div>

      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold mb-2 md:mb-0">기간 설정</h2>
          <div className="flex space-x-4">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                시작일
              </label>
              <input
                type="date"
                id="start-date"
                value={formatDate(startDate)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                종료일
              </label>
              <input
                type="date"
                id="end-date"
                value={formatDate(endDate)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="self-end">
              <button
                onClick={handleDateChange}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 h-10"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderSummary()}
      {renderSuggestions()}
      {renderTimeUsageByActivity()}
      {renderHourlyDistribution()}
    </div>
  );
};

export default TimeAnalytics;
