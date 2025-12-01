import React from "react";
import { FaReact } from "react-icons/fa";
import { Avatar, Button, Divider, Dropdown, Menu, Space } from "antd";
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

  const handlePartner = () => {
    navigate("/partner");
  };
  const handleLogout = async () => {
    const res = await logoutApi();
    if (res.data) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
    }
  };

  let userMenuItems = [
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
  if (user?.role === "ADMIN") {
    userMenuItems.unshift({
      label: <Link to="/admin">Trang quản trị</Link>,
      key: "admin",
    });
  }
  if (user?.role === "HOTEL_OWNER") {
    userMenuItems.unshift({
      label: <Link to="/owner">Trang quản trị</Link>,
      key: "owner",
    });
  }

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
    user?.avatar
  }`;

  return (
    <header className="app-header">
      <div className="global-container header-inner">
        <div className="header-left">
          <div className="logo-block">
            <FaReact size={34} color="#00D4AA" />
            <span className="logo-text">Hotel Aliu</span>
          </div>
        </div>
        <nav className="header-nav">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="vn">Tiếng Việt - VND</Menu.Item>
                <Menu.Item key="en">English - USD</Menu.Item>
              </Menu>
            }
          >
            <a onClick={(e) => e.preventDefault()} className="nav-link">
              🇻🇳 <span className="fw500">VND | VI</span>{" "}
              <DownOutlined className="caret" />
            </a>
          </Dropdown>

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="help1">Trung tâm trợ giúp</Menu.Item>
                <Menu.Item key="help2">Liên hệ chúng tôi</Menu.Item>
              </Menu>
            }
          >
            <a onClick={(e) => e.preventDefault()} className="nav-link">
              <QuestionCircleOutlined /> Hỗ trợ{" "}
              <DownOutlined className="caret" />
            </a>
          </Dropdown>

          <a className="nav-link" onClick={handlePartner}>
            Hợp tác với chúng tôi
          </a>
          <a href="#" className="nav-link">
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
