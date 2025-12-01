// src/components/admin/hotel/detail.hotel.tsx

import { Drawer, Descriptions, Tag, Divider, Space, Avatar, Rate } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  IdcardOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface IProps {
  open: boolean;
  onClose: () => void;
  data: IHotel | null;
}

const DetailHotel = (props: IProps) => {
  const { open, onClose, data } = props;

  if (!data) return null;

  // ✅ Format địa chỉ
  const fullAddress = [
    data.address_line,
    data.ward,
    data.district,
    data.city,
    data.province,
  ]
    .filter(Boolean)
    .join(", ");

  // ✅ Format trạng thái
  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { color: "orange", text: "⏳ Chờ duyệt" },
      APPROVED: { color: "green", text: "✅ Đã duyệt" },
      SUSPENDED: { color: "red", text: "🚫 Tạm ngưng" },
    };
    return (
      configs[status as keyof typeof configs] || {
        color: "default",
        text: status,
      }
    );
  };

  const statusConfig = getStatusConfig(data.approval_status);

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            style={{ background: "#1890ff" }}
            icon={<HomeOutlined />}
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              Chi tiết khách sạn
            </div>
            <div style={{ fontSize: 12, color: "#999", fontWeight: 400 }}>
              ID: {data.id}
            </div>
          </div>
        </div>
      }
      placement="right"
      width="50vw"
      open={open}
      onClose={onClose}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "24px",
          borderRadius: 8,
          marginBottom: 24,
          color: "white",
          marginTop: -24,
          marginLeft: -24,
          marginRight: -24,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          {data.name}
        </div>
        <Space size="large" wrap>
          <Tag
            color={statusConfig.color}
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {statusConfig.text}
          </Tag>
          <span style={{ opacity: 0.9 }}>
            <GlobalOutlined /> {data.country_code}
          </span>
          <span style={{ opacity: 0.9 }}>
            <ClockCircleOutlined /> {data.timezone}
          </span>
        </Space>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 12,
            color: "#1890ff",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <PhoneOutlined />
          Thông tin liên hệ
        </div>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item
            label={
              <span>
                <MailOutlined style={{ marginRight: 8 }} />
                Email
              </span>
            }
          >
            {data.email ? (
              <a href={`mailto:${data.email}`} style={{ color: "#1890ff" }}>
                {data.email}
              </a>
            ) : (
              <span style={{ color: "#999" }}>Chưa có</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <PhoneOutlined style={{ marginRight: 8 }} />
                Số điện thoại
              </span>
            }
          >
            {data.phone ? (
              <a href={`tel:${data.phone}`} style={{ color: "#1890ff" }}>
                {data.phone}
              </a>
            ) : (
              <span style={{ color: "#999" }}>Chưa có</span>
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 12,
            color: "#1890ff",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <EnvironmentOutlined />
          Địa chỉ
        </div>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Địa chỉ đầy đủ">
            {fullAddress || (
              <span style={{ color: "#999" }}>Chưa có thông tin địa chỉ</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Địa chỉ chi tiết">
            {data.address_line || (
              <span style={{ color: "#999" }}>Chưa có</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Phường/Xã">
            {data.ward || <span style={{ color: "#999" }}>Chưa có</span>}
          </Descriptions.Item>

          <Descriptions.Item label="Quận/Huyện">
            {data.district || <span style={{ color: "#999" }}>Chưa có</span>}
          </Descriptions.Item>

          <Descriptions.Item label="Thành phố">
            {data.city || <span style={{ color: "#999" }}>Chưa có</span>}
          </Descriptions.Item>

          <Descriptions.Item label="Tỉnh/Thành phố">
            {data.province || <span style={{ color: "#999" }}>Chưa có</span>}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {data.description && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: "#1890ff",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <InfoCircleOutlined />
            Mô tả
          </div>
          <div
            style={{
              padding: 16,
              background: "#f5f5f5",
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              border: "1px solid #e8e8e8",
            }}
          >
            {data.description}
          </div>
        </div>
      )}

      <Divider />

      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 12,
            color: "#1890ff",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <IdcardOutlined />
          Thông tin hệ thống
        </div>
        <Descriptions.Item label="Hạng sao">
          {data.star_rating ? (
            <div>
              <Rate
                disabled
                value={data.star_rating}
                style={{ fontSize: 16 }}
              />
              <span style={{ marginLeft: 8 }}>({data.star_rating} sao)</span>
            </div>
          ) : (
            <span style={{ color: "#999" }}>Chưa đánh giá</span>
          )}
        </Descriptions.Item>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="ID">
            <Tag color="blue">{data.id}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <GlobalOutlined style={{ marginRight: 8 }} />
                Mã quốc gia
              </span>
            }
          >
            {data.country_code}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Múi giờ
              </span>
            }
          >
            {data.timezone}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Ngày tạo
              </span>
            }
          >
            {dayjs(data.created_at).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Cập nhật lần cuối
              </span>
            }
          >
            {dayjs(data.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 12,
          background: "#e6f7ff",
          border: "1px solid #91d5ff",
          borderRadius: 6,
          fontSize: 13,
          color: "#0050b3",
        }}
      >
        💡 <strong>Ghi chú:</strong> Thông tin được cập nhật lần cuối vào{" "}
        {dayjs(data.updatedAt).format("DD/MM/YYYY HH:mm:ss")} bởi{" "}
        <strong>Aliu9x</strong>
      </div>
    </Drawer>
  );
};

export default DetailHotel;
