import { Button, Result } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";

interface IProps {
  children: React.ReactNode;
}

export const ProtectedRoute = (props: IProps) => {
  const { isAuthenticated, user, isAppLoading } = useCurrentApp();
  const location = useLocation();

  // Đang bootstrap → show loading, tránh flash Not Login
  if (isAppLoading || isAuthenticated === null) {
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

  if (!isAuthenticated) {
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

  const isAdminRoute = location.pathname.includes("admin");
  if (isAdminRoute && user?.role === "CUSTOMER") {
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