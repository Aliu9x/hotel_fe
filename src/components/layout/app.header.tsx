import React from "react";
import { FaReact } from "react-icons/fa";
import { Avatar, Button, Divider, Dropdown, Space } from "antd";
import {
  DownOutlined,
  QuestionCircleOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentApp } from "components/context/app.context";
import { logoutApi } from "@/services/api";
import "./app.header.scss";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setIsAuthenticated, setUser } =
    useCurrentApp();

  const handlePartner = () => navigate("/partner");
  const handleRetrieve = () => navigate("/retrieve");

  const handleLogout = async () => {
    try {
      const res = await logoutApi();
      if (res?.data) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("access_token");
        navigate("/"); // tùy ý
      }
    } catch {
      // ignore
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      navigate("/");
    }
  };

  const userMenuItems = [
    ...(user?.role === "ADMIN"
      ? [{ label: <Link to="/admin">Trang quản trị</Link>, key: "admin" }]
      : []),
    ...(user?.role === "HOTEL_OWNER"
      ? [{ label: <Link to="/owner">Trang quản trị</Link>, key: "owner" }]
      : []),
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => alert("me")}>
          Quản lý tài khoản
        </label>
      ),
      key: "account",
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </label>
      ),
      key: "logout",
    },
  ];

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
    user?.avatar ?? ""
  }`;

  return (
    <header className="app-header">
      <div className="global-container header-inner">
        <div className="header-left">
          <div className="logo-block">
            <FaReact size={34} color="#00D4AA" />
            <span
              className="logo-text"
              onClick={() => {
                navigate("/");
              }}
            >
              Hotel Aliu
            </span>
          </div>
        </div>
        <nav className="header-nav">
          <Dropdown
            menu={{
              items: [
                { label: "Tiếng Việt - VND", key: "vn" },
                { label: "English - USD", key: "en" },
              ],
            }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()} className="nav-link">
              🇻🇳 <span className="fw500">VND | VI</span>{" "}
              <DownOutlined className="caret" />
            </a>
          </Dropdown>

          <Dropdown
            menu={{
              items: [
                { label: "Trung tâm trợ giúp", key: "help1" },
                { label: "Liên hệ chúng tôi", key: "help2" },
              ],
            }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()} className="nav-link">
              <QuestionCircleOutlined /> Hỗ trợ{" "}
              <DownOutlined className="caret" />
            </a>
          </Dropdown>

          <a className="nav-link" onClick={handlePartner}>
            Hợp tác với chúng tôi
          </a>
          <a className="nav-link" onClick={handleRetrieve}>
            <ShoppingOutlined /> Đặt chỗ của tôi
          </a>

          <Divider type="vertical" className="divider-thin" />

          {!isAuthenticated ? (
            <>
              <Button
                icon={<UserOutlined />}
                onClick={() => navigate("/login")}
                className="btn-outline-white"
              >
                Đăng Nhập
              </Button>
              <Button
                type="primary"
                onClick={() => navigate("/register")}
                className="btn-solid-primary"
              >
                Đăng ký
              </Button>
            </>
          ) : (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar src={urlAvatar} size={42} />
                <span className="user-email">{user?.email}</span>
              </Space>
            </Dropdown>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
