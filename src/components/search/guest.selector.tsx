import React from "react";
import { Button } from "antd";
import { MinusOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";

export interface IGuestsValue {
  adults: number;
  children: number;
  rooms: number;
}

interface GuestSelectorProps {
  value: IGuestsValue;
  onChange: (next: IGuestsValue) => void;
  onClose?: () => void;
  minAdults?: number;
  minRooms?: number;
  className?: string;
}

const GuestSelector: React.FC<GuestSelectorProps> = ({
  value,
  onChange,
  onClose,
  minAdults = 1,
  minRooms = 1,
  className,
}) => {
  const { adults, children, rooms } = value;
  const update = (patch: Partial<IGuestsValue>) =>
    onChange({ ...value, ...patch });

  return (
    <div
      className={className}
      style={{ width: 320, padding: "16px 0", fontSize: 15 }}
    >
      {/* Người lớn */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <UserOutlined style={{ color: "#0071f2", fontSize: 20 }} />
          <span style={{ fontSize: 15, fontWeight: 500 }}>Người lớn</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            type="text"
            icon={<MinusOutlined />}
            disabled={adults <= minAdults}
            onClick={() => update({ adults: Math.max(minAdults, adults - 1) })}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              justifyContent: "center",
              color: adults <= minAdults ? "#d9d9d9" : "#0071f2",
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              minWidth: 30,
              textAlign: "center",
            }}
          >
            {adults}
          </span>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => update({ adults: adults + 1 })}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              justifyContent: "center",
              color: "#0071f2",
            }}
          />
        </div>
      </div>

      {/* Trẻ em */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16 }}>👶</span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Trẻ em</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            type="text"
            icon={<MinusOutlined />}
            disabled={children <= 0}
            onClick={() => update({ children: Math.max(0, children - 1) })}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              justifyContent: "center",
              color: children <= 0 ? "#d9d9d9" : "#0071f2",
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              minWidth: 30,
              textAlign: "center",
            }}
          >
            {children}
          </span>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => update({ children: children + 1 })}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              justifyContent: "center",
              color: "#0071f2",
            }}
          />
        </div>
      </div>

      {/* Phòng */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16 }}>🛏️</span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Phòng</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            type="text"
            icon={<MinusOutlined />}
            disabled={rooms <= minRooms}
            onClick={() => update({ rooms: Math.max(minRooms, rooms - 1) })}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              justifyContent: "center",
              color: rooms <= minRooms ? "#d9d9d9" : "#0071f2",
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              minWidth: 30,
              textAlign: "center",
            }}
          >
            {rooms}
          </span>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => update({ rooms: rooms + 1 })}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              justifyContent: "center",
              color: "#0071f2",
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: "right", paddingRight: 16 }}>
        <Button
          type="primary"
          onClick={onClose}
          style={{
            background: "#0071f2",
            borderRadius: 8,
            fontWeight: 600,
            padding: "8px 24px",
            height: "auto",
          }}
        >
          Xong
        </Button>
      </div>
    </div>
  );
};

export default GuestSelector;
