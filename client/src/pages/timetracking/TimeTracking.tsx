import React, { useState, useEffect } from "react";
import { useTimeTracking } from "../../contexts/useTimeTracking";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import LoadingIndicator from "../../components/LoadingIndicator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faBook,
  faCoffee,
  faMoon,
  faRunning,
  faUtensils,
  faHashtag,
  faCar,
  faHome,
  faGamepad,
  faTrash,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface TimeSlot {
  hour: number;
  minute: number;
  ampm: string;
  formatted: string;
}

const QUICK_TIME_SLOTS = [
  {
    label: "아침 (7-9시)",
    start: { hour: 7, minute: 0 },
    end: { hour: 9, minute: 0 },
  },
  {
    label: "오전 (9-12시)",
    start: { hour: 9, minute: 0 },
    end: { hour: 12, minute: 0 },
  },
  {
    label: "점심 (12-13시)",
    start: { hour: 12, minute: 0 },
    end: { hour: 13, minute: 0 },
  },
  {
    label: "오후 (13-18시)",
    start: { hour: 13, minute: 0 },
    end: { hour: 18, minute: 0 },
  },
  {
    label: "저녁 (18-20시)",
    start: { hour: 18, minute: 0 },
    end: { hour: 20, minute: 0 },
  },
];

const TimeTracking: React.FC = () => {
  const {
    activityTypes,
    activityRecords,
    isLoading,
    fetchActivityTypes,
    createActivityType,
    fetchActivityRecords,
    createActivityRecord,
    deleteActivityRecord,
  } = useTimeTracking();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [startTime, setStartTime] = useState<TimeSlot>({
    hour: 9,
    minute: 0,
    ampm: "오전",
    formatted: "09:00",
  });
  const [endTime, setEndTime] = useState<TimeSlot>({
    hour: 10,
    minute: 0,
    ampm: "오전",
    formatted: "10:00",
  });
  const [note, setNote] = useState<string>("");
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColor, setNewTypeColor] = useState("#3B82F6");
  const [newTypeIcon, setNewTypeIcon] = useState("briefcase");

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchActivityTypes();
  }, [fetchActivityTypes]);

  useEffect(() => {
    // 선택된 날짜의 시작과 끝 설정
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    fetchActivityRecords(startOfDay, endOfDay);
  }, [selectedDate, fetchActivityRecords]);

  // 날짜 형식 변환 헬퍼 함수
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // 시간 형식 관련 헬퍼 함수들
  const generateTimeOptions = (): TimeSlot[] => {
    const options: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const ampm = hour < 12 ? "오전" : "오후";
        const displayHour = hour % 12 || 12;
        const formattedHour = displayHour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");

        options.push({
          hour,
          minute,
          ampm,
          formatted: `${formattedHour}:${formattedMinute}`,
        });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // 시작 시간이 변경될 때 종료 시간 자동 조정 (시작 시간보다 30분 뒤)
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    const selected = timeOptions[selectedIndex];
    setStartTime(selected);

    // 종료 시간이 시작 시간보다 이전이면 자동으로 30분 뒤로 조정
    const endIndex = Math.min(selectedIndex + 1, timeOptions.length - 1);
    setEndTime(timeOptions[endIndex]);
  };

  // 종료 시간 변경 핸들러
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    const selected = timeOptions[selectedIndex];

    // 종료 시간이 시작 시간보다 이전이면 경고
    const startIndex = timeOptions.findIndex(
      (t) => t.hour === startTime.hour && t.minute === startTime.minute,
    );

    if (selectedIndex <= startIndex) {
      toast.warning("종료 시간은 시작 시간보다 이후여야 합니다.");
      return;
    }

    setEndTime(selected);
  };

  // 활동 기록 추가 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActivityId) {
      toast.warning("활동 유형을 선택해주세요.");
      return;
    }

    // 시작/종료 시간 Date 객체 생성
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startTime.hour, startTime.minute, 0, 0);

    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endTime.hour, endTime.minute, 0, 0);

    // 종료 시간이 시작 시간보다 이전이면 경고
    if (endDateTime <= startDateTime) {
      toast.warning("종료 시간은 시작 시간보다 이후여야 합니다.");
      return;
    }

    try {
      await createActivityRecord(
        selectedActivityId,
        startDateTime,
        endDateTime,
        note,
      );

      // 입력 폼 리셋
      setNote("");
    } catch (error) {
      console.error("활동 기록 추가 실패:", error);
    }
  };

  // 전날, 다음날로 이동
  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  // 시간 표시 변환 (24시간 -> 12시간)
  const formatTimeDisplay = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours < 12 ? "오전" : "오후";
    const displayHours = hours % 12 || 12;

    return `${ampm} ${displayHours}:${minutes}`;
  };

  // 활동 지속 시간 계산 (분 단위)
  const calculateDuration = (start: Date, end: Date): number => {
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  // 아이콘 옵션
  const iconOptions = [
    { value: "briefcase", label: "업무" },
    { value: "book", label: "공부" },
    { value: "coffee", label: "휴식" },
    { value: "moon", label: "수면" },
    { value: "running", label: "운동" },
    { value: "utensils", label: "식사" },
    { value: "hashtag", label: "SNS" },
    { value: "car", label: "이동" },
    { value: "home", label: "집안일" },
    { value: "gamepad", label: "여가" },
  ];

  // 아이콘 매핑
  const getIconForType = (iconName: string) => {
    const iconMap: { [key: string]: IconDefinition } = {
      briefcase: faBriefcase,
      book: faBook,
      coffee: faCoffee,
      moon: faMoon,
      running: faRunning,
      utensils: faUtensils,
      hashtag: faHashtag,
      car: faCar,
      home: faHome,
      gamepad: faGamepad,
    };
    return iconMap[iconName] || faClock;
  };

  // 빠른 시간대 선택 핸들러
  const handleQuickTimeSlot = (slot: (typeof QUICK_TIME_SLOTS)[0]) => {
    setStartTime({
      hour: slot.start.hour,
      minute: slot.start.minute,
      ampm: slot.start.hour < 12 ? "오전" : "오후",
      formatted: `${String(slot.start.hour).padStart(2, "0")}:${String(
        slot.start.minute,
      ).padStart(2, "0")}`,
    });
    setEndTime({
      hour: slot.end.hour,
      minute: slot.end.minute,
      ampm: slot.end.hour < 12 ? "오전" : "오후",
      formatted: `${String(slot.end.hour).padStart(2, "0")}:${String(
        slot.end.minute,
      ).padStart(2, "0")}`,
    });
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">시간 기록</h1>
        <Link
          to="/timetracking/analytics"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faClock} />
          시간 분석 보기
        </Link>
      </div>

      {/* 날짜 선택 */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-lg transition-shadow hover:shadow-xl">
        <button
          onClick={handlePrevDay}
          className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          &lt; 이전 날
        </button>
        <h2 className="text-xl font-semibold">{formatDate(selectedDate)}</h2>
        <button
          onClick={handleNextDay}
          className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          다음 날 &gt;
        </button>
      </div>

      {/* 활동 기록 폼 */}
      <div className="bg-white rounded-lg p-6 shadow-lg mb-6 transition-all hover:shadow-xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faClock} className="text-blue-500" />새 활동
          기록하기
        </h2>

        {/* 빠른 시간대 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            빠른 시간대 선택
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TIME_SLOTS.map((slot, index) => (
              <button
                key={index}
                onClick={() => handleQuickTimeSlot(slot)}
                className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 활동 유형 선택 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                활동 유형
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  required
                >
                  <option value="">활동 유형 선택...</option>
                  {activityTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewTypeForm(!showNewTypeForm)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  {showNewTypeForm ? "취소" : "추가"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모 (선택사항)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="활동에 대한 간단한 메모"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* 새 활동 유형 추가 폼 */}
          {showNewTypeForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 animate-fade-in">
              <h3 className="text-md font-medium mb-3">새 활동 유형 추가</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="활동 이름"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    아이콘
                  </label>
                  <select
                    value={newTypeIcon}
                    onChange={(e) => setNewTypeIcon(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    색상
                  </label>
                  <input
                    type="color"
                    value={newTypeColor}
                    onChange={(e) => setNewTypeColor(e.target.value)}
                    className="h-9 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  onClick={async () => {
                    if (!newTypeName) {
                      toast.warning("활동 이름은 필수입니다.");
                      return;
                    }
                    await createActivityType(
                      newTypeName,
                      newTypeColor,
                      newTypeIcon,
                    );
                    setNewTypeName("");
                    setShowNewTypeForm(false);
                  }}
                >
                  활동 유형 저장
                </button>
              </div>
            </div>
          )}

          {/* 시간 선택 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <select
                value={timeOptions.findIndex(
                  (t) =>
                    t.hour === startTime.hour && t.minute === startTime.minute,
                )}
                onChange={handleStartTimeChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                required
              >
                {timeOptions.map((time, index) => (
                  <option key={`start-${index}`} value={index}>
                    {time.ampm} {time.formatted}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <select
                value={timeOptions.findIndex(
                  (t) => t.hour === endTime.hour && t.minute === endTime.minute,
                )}
                onChange={handleEndTimeChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                required
              >
                {timeOptions.map((time, index) => (
                  <option key={`end-${index}`} value={index}>
                    {time.ampm} {time.formatted}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faClock} />
              {isLoading ? "처리중..." : "기록 저장"}
            </button>
          </div>
        </form>
      </div>

      {/* 오늘의 기록 목록 */}
      <div className="bg-white rounded-lg p-6 shadow-lg transition-all hover:shadow-xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faClock} className="text-blue-500" />
          오늘의 활동 기록
        </h2>

        {activityRecords.length === 0 ? (
          <div className="text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">
            <FontAwesomeIcon
              icon={faClock}
              className="text-4xl mb-2 text-gray-400"
            />
            <p>오늘 기록된 활동이 없습니다.</p>
            <p className="text-sm text-gray-400">새로운 활동을 기록해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityRecords.map((record) => {
              const activityType = activityTypes.find(
                (type) => type.id === record.activityTypeId,
              );

              return (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: activityType?.color || "#3B82F6",
                  }}
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={getIconForType(activityType?.icon || "clock")}
                        className="text-gray-600"
                      />
                      <h3 className="font-medium">
                        {activityType?.name || "알 수 없음"}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatTimeDisplay(record.startTime)} -{" "}
                      {formatTimeDisplay(record.endTime)}
                      <span className="ml-2 text-gray-500">
                        (
                        {Math.floor(
                          calculateDuration(record.startTime, record.endTime) /
                            60,
                        )}
                        시간{" "}
                        {calculateDuration(record.startTime, record.endTime) %
                          60}
                        분)
                      </span>
                    </p>
                    {record.note && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        {record.note}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteActivityRecord(record.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="삭제"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracking;
