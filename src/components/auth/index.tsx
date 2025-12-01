import { Button, Result } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";
import { useEffect } from "react";
import { fetchAccountApi } from "@/services/api";

interface IProps {
  children: React.ReactNode;
}

export const ProtectedRoute = (props: IProps) => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    isAppLoading,
    setIsAppLoading,
  } = useCurrentApp();

  const location = useLocation();

  // 🔥 Chỉ fetch khi user chưa có + route này cần bảo vệ
  useEffect(() => {
    const loadAccount = async () => {
      setIsAppLoading(true);
      const res = await fetchAccountApi();

      if (res?.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }

      setIsAppLoading(false);
    };

    if (!isAuthenticated && !user) {
      loadAccount();
    }
  }, []);

  // ❗Loading khi fetch account
  if (isAppLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        Đang tải...
      </div>
    );
  }

  // ❗Chưa login
  if (isAuthenticated === false) {
    return (
      <Result
        status="404"
        title="Not Login"
        subTitle="Xin lỗi! Bạn cần đăng nhập để sử dụng tính năng này."
        extra={
          <Button type="primary">
            <Link to={"/login"}>Đăng nhập </Link>
          </Button>
        }
      />
    );
  }

  // Check admin route
  const isAdminRoute = location.pathname.includes("admin");
  if (isAdminRoute && user?.role === "USER") {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary">
            <Link to={"/"}>Trang chủ</Link>
          </Button>
        }
      />
    );
  }

  return <>{props.children}</>;
};
