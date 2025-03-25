import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../services/apiClient";
import { AuthContext, User } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 토큰과 사용자 정보 모두 확인
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token) {
      // 공유 API 인스턴스에 토큰 설정
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 저장된 사용자 정보가 있으면 먼저 상태 설정 (네트워크 요청 실패해도 로컬 정보 유지)
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }

      // 서버에서도 최신 정보 가져오기 시도
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/profile");

      // 서버 응답에 name 필드가 없는 경우를 대비
      const userData = {
        ...response.data,
        // 서버 응답에 name이 없고 로컬에 저장된 name이 있으면 유지
        name:
          response.data.name ||
          JSON.parse(localStorage.getItem("user") || "{}").name ||
          "",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // 오류 발생해도 토큰과 사용자 정보 유지 (401 오류인 경우만 삭제)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      }
      // 그 외 오류는 로컬 데이터를 유지
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, user } = response.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setUser(user);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
    });
    const { accessToken, user } = response.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
