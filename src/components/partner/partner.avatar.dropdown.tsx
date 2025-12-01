import React, { useState, useRef, useEffect } from "react";
import { Button } from "antd";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import "./partner.avatar.dropdown.scss";

interface Props {
  email?: string;
  onLogout?: () => void;
  onAccountSettings?: () => void;
}

const PartnerAvatarDropdown: React.FC<Props> = ({
  email = "partner@example.com",
  onLogout,
  onAccountSettings,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
            <LogoutOutlined /> <span>Đăng xuất</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerAvatarDropdown;