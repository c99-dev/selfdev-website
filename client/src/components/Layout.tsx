import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { toast } from "react-toastify";

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNonAuthNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="font-bold text-xl text-gray-800">
                  자기계발
                </span>
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/mindset"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={(e) =>
                    handleNonAuthNavigation(e, "/mindset", "마인드셋 테스트")
                  }
                >
                  마인드셋 테스트
                </Link>
                <Link
                  to="/mindset/history"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={(e) =>
                    handleNonAuthNavigation(
                      e,
                      "/mindset/history",
                      "테스트 기록",
                    )
                  }
                >
                  테스트 기록
                </Link>
                <Link
                  to="/timetracking"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={(e) =>
                    handleNonAuthNavigation(e, "/timetracking", "시간 기록")
                  }
                >
                  시간 기록
                </Link>
                <Link
                  to="/timetracking/analytics"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={(e) =>
                    handleNonAuthNavigation(
                      e,
                      "/timetracking/analytics",
                      "시간 분석",
                    )
                  }
                >
                  시간 분석
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{user.name}님</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
