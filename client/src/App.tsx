import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MindsetTest from "./pages/mindset/MindsetTest";
import MindsetHistory from "./pages/mindset/MindsetHistory";
import TimeTracking from "./pages/timetracking/TimeTracking";
import TimeAnalytics from "./pages/timetracking/TimeAnalytics";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { MindsetProvider } from "./contexts/mindset/MindsetProvider";
import { TimeTrackingProvider } from "./contexts/timetracking/TimeTrackingProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <MindsetProvider>
        <TimeTrackingProvider>
          <Router>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route
                  path="mindset"
                  element={
                    <PrivateRoute>
                      <MindsetTest />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="mindset/history"
                  element={
                    <PrivateRoute>
                      <MindsetHistory />
                    </PrivateRoute>
                  }
                />
                {/* 시간 기록 경로 */}
                <Route
                  path="timetracking"
                  element={
                    <PrivateRoute>
                      <TimeTracking />
                    </PrivateRoute>
                  }
                />
                {/* 시간 분석 경로 */}
                <Route
                  path="timetracking/analytics"
                  element={
                    <PrivateRoute>
                      <TimeAnalytics />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </TimeTrackingProvider>
      </MindsetProvider>
    </AuthProvider>
  );
}

export default App;
