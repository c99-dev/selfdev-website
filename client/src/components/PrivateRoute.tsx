import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useMindset } from "../contexts/useMindset";
import api from "../services/apiClient";
import LoadingIndicator from "./LoadingIndicator";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { refreshTestStatus } = useMindset();
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const mountedRef = useRef(true);
  const checkingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    checkingRef.current = false;

    return () => {
      mountedRef.current = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    const checkTestAvailability = async () => {
      if (!mountedRef.current || checkingRef.current) return;
      checkingRef.current = true;

      if (location.pathname === "/mindset") {
        try {
          const response = await api.get("/mindset/self-test/can-take");
          if (!mountedRef.current) return;

          if (!response.data.canTake) {
            await refreshTestStatus(); // 상태 업데이트 (토스트는 MindsetProvider에서 처리)
            navigate("/mindset/history", { replace: true });
            return;
          }
        } catch (error) {
          console.error("테스트 가능 여부 확인 오류:", error);
          if (!mountedRef.current) return;
          navigate("/mindset/history", { replace: true });
          return;
        }
      }
      setIsChecking(false);
      checkingRef.current = false;
    };

    if (!loading && user) {
      checkTestAvailability();
    } else if (!loading) {
      setIsChecking(false);
    }
  }, [loading, user, location.pathname, navigate, refreshTestStatus]);

  if (loading || isChecking) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
