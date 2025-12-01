import React, { useState } from "react";
import {
  HeartTwoTone,
  DollarCircleOutlined,
  BarChartOutlined,
  BookOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Space, Avatar, Result, Button } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";
import { logoutApi } from "@/services/api";
import { Content, Footer, Header } from "antd/es/layout/layout";

const LayoutOwner = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const { user, setIsAuthenticated, setUser, isAuthenticated } =
    useCurrentApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await logoutApi();
    if (res.data) {
      navigate("/partner");
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
    }
  };
  const items = [
    {
      label: "Hiệu suất",
      key: "performance",
      icon: <BarChartOutlined />,
      children: [
        {
          label: <Link to="/owner">Bảng điều khiển</Link>,
          key: "dashboard",
        },
        { label: <Link to="/owner/analysis">Phân tích</Link>, key: "analysis" },
        { label: <Link to="/owner/reviews">Đánh giá</Link>, key: "reviews" },
      ],
    },
    {
      label: "Đơn đặt phòng",
      key: "booking",
      icon: <BookOutlined />,
      children: [
        {
          label: <Link to="/owner/booking">Danh sách đơn</Link>,
          key: "booking-list",
        },
        {
          label: <Link to="/owner/booking/calendar">Lịch đặt</Link>,
          key: "booking-calendar",
        },
      ],
    },
    {
      label: "Giá & kế hoạch giá ",
      key: "price",
      icon: <DollarCircleOutlined />,
      children: [
        {
          label: <Link to="/owner/price">Các gói giá </Link>,
          key: "rate-plan",
        },
        {
          label: <Link to="/owner/price/flexible">Giá linh hoạt</Link>,
          key: "price-flexible",
        },
      ],
    },
    {
      label: "Cơ sở lưu trú",
      key: "property",

      children: [
        {
          label: <Link to="/owner/property">Chính sách lưu trú</Link>,
          key: "property-details",
        },
        {
          label: <Link to="/owner/property/rooms">Thiết lập phòng</Link>,
          key: "property-rooms",
        },
        {
          label: <Link to="/owner/property/cancellation">Chính sách hủy</Link>,
          key: "property-cancellation",
        },
      ],
    },
    {
      label: <Link to="/owner/settings">Thiết lập</Link>,
      key: "settings",
      icon: <SettingOutlined />,
    },
  ];

  const itemsDropdown = [
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => alert("me")}>
          Quản lý tài khoản
        </label>
      ),
      key: "account",
    },
    {
      label: <Link to={"/"}>Trang chủ</Link>,
      key: "home",
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: "logout",
    },
  ];

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
    user?.avatar
  }`;

  if (isAuthenticated === false) {
    return <Outlet />;
  }
  const isAdminRoute = location.pathname.includes("admin");
  if (isAuthenticated === true && isAdminRoute === true) {
    const role = user?.role;
    if (role === "USER") {
      return (
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi! Bạn không có quyền truy cập trang này."
          extra={
            <Button type="primary">
              <Link to={"/"}>Trang chủ</Link>
            </Button>
          }
        />
      );
    }
  }

  return (
    <>
      <Layout style={{ minHeight: "100vh" }} className="layout-admin">
        {/* ===== HEADER ===== */}
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
            padding: "0 25px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 18, color: "#1890ff" }}>
            Hotel Admin
          </div>

          <Menu
            mode="horizontal"
            items={items}
            style={{
              flex: 1,
              marginLeft: 40,
              borderBottom: "none",
            }}
          />

          <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
            <Space style={{ cursor: "pointer", fontWeight: 500 }}>
              <Avatar src={urlAvatar} />
              {user?.fullName}
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: "15px" }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: "center", background: "#fff" }}>
          Hotel Admin Dashboard ©2025 — Made with{" "}
          <HeartTwoTone twoToneColor="#eb2f96" />
        </Footer>
      </Layout>
    </>
  );
};

export default LayoutOwner;
