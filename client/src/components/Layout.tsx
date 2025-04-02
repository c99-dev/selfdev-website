import React, { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { toast } from "react-toastify";

// 메뉴 타입 정의
interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  stageNumber: string;
  title: string;
  subMenus: SubMenuItem[];
  icon?: string;
  color: string;
  bgColor: string;
}

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 단계별 메뉴 정의 (Home.tsx의 색상과 통일)
  const stageMenus: MenuItem[] = [
    {
      stageNumber: "1단계",
      title: "마인드셋 전환",
      subMenus: [
        { name: "마인드셋 테스트", path: "/mindset" },
        { name: "테스트 기록", path: "/mindset/history" },
      ],
      icon: "📝",
      color: "#3B82F6", // blue-500
      bgColor: "bg-blue-500",
    },
    {
      stageNumber: "2단계",
      title: "시간 사용 기록",
      subMenus: [
        { name: "시간 기록", path: "/timetracking" },
        { name: "시간 분석", path: "/timetracking/analytics" },
      ],
      icon: "⏱️",
      color: "#22C55E", // green-500
      bgColor: "bg-green-500",
    },
    {
      stageNumber: "3단계",
      title: "환경과 습관",
      subMenus: [
        { name: "환경 설정 가이드", path: "/environment" },
        { name: "습관 추적", path: "/habits" },
        { name: "챌린지", path: "/challenges" },
      ],
      icon: "🌱",
      color: "#A855F7", // purple-500
      bgColor: "bg-purple-500",
    },
    {
      stageNumber: "4단계",
      title: "정확한 목표",
      subMenus: [
        { name: "목표 설정", path: "/goals" },
        { name: "목표 관리", path: "/goals/manage" },
      ],
      icon: "🎯",
      color: "#EAB308", // yellow-500
      bgColor: "bg-yellow-500",
    },
    {
      stageNumber: "5단계",
      title: "목표 단순화",
      subMenus: [
        { name: "하위 목표 설정", path: "/goals/sub" },
        { name: "진행 상황", path: "/goals/progress" },
      ],
      icon: "✅",
      color: "#EF4444", // red-500
      bgColor: "bg-red-500",
    },
  ];

  // 드롭다운 메뉴의 위치를 계산하여 설정
  useEffect(() => {
    if (showDropdown && navMenuRef.current && dropdownRef.current) {
      const rect = navMenuRef.current.getBoundingClientRect();
      dropdownRef.current.style.left = `${rect.left}px`;
      dropdownRef.current.style.width = `${rect.width}px`;
    }
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNonAuthNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    _path: string,
    menuName: string,
  ) => {
    if (!user) {
      e.preventDefault();
      toast.info(`${menuName} 기능을 이용하시려면 로그인이 필요합니다.`, {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
    }
  };

  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  // 현재 경로가 주어진 메뉴에 속하는지 확인
  const isActiveMenu = (menuItem: MenuItem): boolean => {
    return menuItem.subMenus.some(
      (subMenu) =>
        location.pathname === subMenu.path ||
        (subMenu.path !== "/" && location.pathname.startsWith(subMenu.path)),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav
        className="bg-white shadow-lg relative"
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="font-bold text-xl text-gray-800">
                  자기계발
                </span>
              </Link>
              <div
                ref={navMenuRef}
                className="ml-10 flex items-center space-x-10"
                onMouseEnter={handleMouseEnter}
              >
                {stageMenus.map((menu, index) => (
                  <div key={index} className="relative group">
                    <div
                      className="cursor-pointer py-4 px-6 font-medium relative transition-colors duration-200 flex items-center gap-1 text-gray-700 hover:text-gray-900"
                      style={{
                        color: isActiveMenu(menu) ? menu.color : undefined,
                      }}
                    >
                      <span className="mr-1">{menu.icon}</span>
                      {menu.stageNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{user.name}님</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 shadow-sm"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 드롭다운 메뉴 영역 */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute bg-white shadow-xl border-t border-gray-100 z-20 rounded-b-lg transition-all duration-300 transform origin-top"
            style={{
              top: "64px",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div className="flex p-2">
              {stageMenus.map((menu, menuIndex) => (
                <div
                  key={menuIndex}
                  className="py-3 px-3 flex-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  style={{ borderTop: `3px solid ${menu.color}` }}
                >
                  <div className="flex items-center mb-2 pb-1 border-b border-gray-100">
                    <h3 className="font-medium" style={{ color: menu.color }}>
                      {menu.title}
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {menu.subMenus.map((subMenu, subIndex) => {
                      const isActive = location.pathname === subMenu.path;
                      return (
                        <li key={subIndex} className="group">
                          <Link
                            to={subMenu.path}
                            className="block px-0.5 py-1.5 text-sm rounded transition-all duration-200 relative text-gray-700 hover:bg-gray-100"
                            style={{
                              backgroundColor: isActive
                                ? `${menu.color}10`
                                : undefined,
                              color: isActive ? menu.color : undefined,
                              fontWeight: isActive ? 500 : undefined,
                            }}
                            onClick={(e) =>
                              handleNonAuthNavigation(
                                e,
                                subMenu.path,
                                subMenu.name,
                              )
                            }
                          >
                            <div className="flex items-center">
                              {isActive && (
                                <span
                                  className="absolute w-1 h-full left-0 top-0 rounded-r"
                                  style={{ backgroundColor: menu.color }}
                                ></span>
                              )}
                              <span className="ml-1">{subMenu.name}</span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* 애니메이션을 위한 CSS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
