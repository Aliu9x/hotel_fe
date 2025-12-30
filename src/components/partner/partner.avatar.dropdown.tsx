import React, { useState, useRef, useEffect } from "react";
import { Button } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "./partner.avatar.dropdown.scss";
import { logoutApi } from "@/services/api";
import { useCurrentApp } from "../context/app.context";
import { useNavigate } from "react-router-dom";

interface Props {
  email?: string |null;
  onLogout?: () => void;
  onAccountSettings?: () => void;
}

const PartnerAvatarDropdown: React.FC<Props> = ({
  email,
  onLogout,
  onAccountSettings,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { setUser, setIsAuthenticated } = useCurrentApp();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    const res = await logoutApi();
    if (res.data) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      navigate("/partner");
    }
  };
  return (
    <div className="pa-wrapper" ref={ref}>
      <Button
        shape="circle"
        icon={<UserOutlined />}
        className="pa-avatar-btn"
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="pa-dropdown">
          <div className="pa-top">
            <div className="pa-avatar-icon">
              <UserOutlined />
            </div>
            <div className="pa-email">{email}</div>
          </div>
          <div className="pa-item" onClick={onAccountSettings}>
            <SettingOutlined /> <span>Cài đặt tài khoản</span>
          </div>
          <div className="pa-item" onClick={onLogout}>
            <LogoutOutlined /> <span onClick={handleLogout}>Đăng xuất</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerAvatarDropdown;
