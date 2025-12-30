import React, { useEffect, useState } from "react";
import {
  HeartTwoTone,
  DollarCircleOutlined,
  BarChartOutlined,
  BookOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Space, Avatar, Result, Button } from "antd";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";
import { logoutApi } from "@/services/api";

const { Header, Content, Footer } = Layout;

const LayoutOwner: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("dashboard");

  const { user, setIsAuthenticated, setUser, isAuthenticated } =
    useCurrentApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const res = await logoutApi();
    if (res?.data) {
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
      ],
    },
    {
      label: "Cơ sở lưu trú",
      key: "property",
      children: [
        {
          label: <Link to="/owner/property/rooms">Thiết lập phòng</Link>,
          key: "property-rooms",
        },
      ],
    },
    {
      label: "Cài đặt",
      key: "settings",
      icon: <SettingOutlined />,
      children: [
        {
          label: (
            <Link to="/owner/settings/hotel-info">Thông tin khách sạn</Link>
          ),
          key: "settings-hotel-info",
        },
        {
          label: (
            <Link to="/owner/settings/media-amenities">Ảnh & Tiện ích</Link>
          ),
          key: "settings-media-amenities",
        },
        {
          label: <Link to="/owner/settings/policy">Chính sách lưu trú</Link>,
          key: "settings-policy",
        },
      ],
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

  const urlAvatar = user?.avatar
    ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`
    : undefined;

  // Đồng bộ selectedKey với route hiện tại
  useEffect(() => {
    const pathname = location.pathname || "";
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      setSelectedKey("dashboard");
      return;
    }

    if (segments[0] === "owner") {
      if (segments.length === 1) {
        setSelectedKey("dashboard");
        return;
      }

      const second = segments[1];

      if (second === "analysis") {
        setSelectedKey("analysis");
        return;
      }
      if (second === "reviews") {
        setSelectedKey("reviews");
        return;
      }
      if (second === "booking") {
        if (segments[2] === "calendar") {
          setSelectedKey("booking-calendar");
        } else {
          setSelectedKey("booking-list");
        }
        return;
      }
      if (second === "price") {
        if (segments[2] === "flexible") {
          setSelectedKey("price-flexible");
        } else {
          setSelectedKey("rate-plan");
        }
        return;
      }
      if (second === "property") {
        if (segments[2] === "rooms") {
          setSelectedKey("property-rooms");
        } else if (segments[2] === "cancellation") {
          setSelectedKey("property-cancellation");
        } else {
          setSelectedKey("property-details");
        }
        return;
      }
      if (second === "settings") {
        if (segments[2] === "policy") {
          setSelectedKey("settings-policy");
        } else {
          setSelectedKey("settings-policy");
        }
        return;
      }

      setSelectedKey("dashboard");
      return;
    }

    setSelectedKey("dashboard");
  }, [location.pathname]);

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
    <Layout style={{ minHeight: "100vh" }} className="layout-admin">
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
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(String(e.key))}
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
  );
};

export default LayoutOwner;
