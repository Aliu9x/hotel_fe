import React, { useState } from "react";
import {
  ExceptionOutlined,
  HeartTwoTone,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EnvironmentOutlined,
  PushpinOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  PictureOutlined,
  DollarOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Space, Avatar, Result, Button } from "antd";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";
import type { MenuProps } from "antd";
import { logoutApi } from "@/services/api";
type MenuItem = Required<MenuProps>["items"][number];

const { Content, Footer, Sider } = Layout;

const LayoutAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const { user, setIsAuthenticated, setUser, isAuthenticated } =
    useCurrentApp();

  const handleLogout = async () => {
    const res = await logoutApi();
    if (res.data) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
    }
  };
  const items: MenuItem[] = [
    {
      label: <Link to="/admin">Dashboard</Link>,
      key: "dashboard",
      icon: <DashboardOutlined />,
    },
    {
      label: <span>Manage users</span>,
      key: "users",
      icon: <UserOutlined />,
      children: [
        {
          label: <Link to="/admin/user/customer">Customers</Link>,
          key: "users-customers",
          icon: <TeamOutlined />,
        },
        {
          label: <Link to="/admin/user/owner">Hotel owners</Link>,
          key: "users-hotel-owners",
          icon: <HomeOutlined />,
        },
      ],
    },

    {
      label: <Link to="/admin/hotel">Manage Hotel</Link>,
      key: "hotel",
      icon: <HomeOutlined />,
    },
    {
      label: <span>Manage location</span>,
      key: "location",
      icon: <EnvironmentOutlined />,
      children: [
        {
          label: <Link to="/admin/location/province">Province / City</Link>,
          key: "province",
          icon: <PushpinOutlined />,
        },
        {
          label: <Link to="/admin/location/district">District</Link>,
          key: "district",
          icon: <PushpinOutlined />,
        },
        {
          label: <Link to="/admin/location/ward">Ward</Link>,
          key: "ward",
          icon: <PushpinOutlined />,
        },
      ],
    },
    {
      label: <Link to="/admin/amenity">Manage amenity</Link>,
      key: "amenity",
      icon: <ExceptionOutlined />,
    },
    {
      label: <Link to="/admin/image-moderation">Image Moderation</Link>,
      key: "image-moderation",
      icon: <PictureOutlined />,
    },
    {
      label: <Link to="/admin/room-types">Manage room type</Link>,
      key: "room-types",
      icon: <ApartmentOutlined />,
    },
    {
      label: <Link to="/admin/rate-plans">Manage rate plan</Link>,
      key: "rate-plans",
      icon: <DollarOutlined />,
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

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user}`;

  if (isAuthenticated === false) {
    return <Outlet />;
  }
  const isAdminRoute = location.pathname.includes("admin");
  if (isAuthenticated === true && isAdminRoute === true) {
    const role = user?.role;
    if (role === "CUSTOMER") {
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
        <Sider
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div style={{ height: 32, margin: 16, textAlign: "center" }}>
            Admin
          </div>
          <Menu
            defaultSelectedKeys={[activeMenu]}
            mode="inline"
            items={items}
            onClick={(e) => setActiveMenu(e.key)}
          />
        </Sider>
        <Layout>
          <div
            className="admin-header"
            style={{
              height: "50px",
              borderBottom: "1px solid #ebebeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 15px",
            }}
          >
            <span>
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: () => setCollapsed(!collapsed),
                }
              )}
            </span>
            <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar src={urlAvatar} />
                {user?.full_name}
              </Space>
            </Dropdown>
          </div>
          <Content style={{ padding: "15px" }}>
            <Outlet />
          </Content>
          <Footer style={{ padding: 0, textAlign: "center" }}>
            System Management <HeartTwoTone />
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default LayoutAdmin;
