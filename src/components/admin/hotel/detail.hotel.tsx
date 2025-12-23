import React, { useEffect, useState, useCallback } from "react";
import {
  Drawer,
  Descriptions,
  Tag,
  message,
  Space,
  Button,
  Image,
  Typography,
  Divider,
  Row,
  Col,
  Skeleton,
  Popconfirm,
  Tooltip,
  Rate,
  Empty,
} from "antd";
import {
  getHotelById,
  updateHotelApproval,
} from "@/services/api";
import {
  CheckCircleTwoTone,
  StopTwoTone,
  ClockCircleTwoTone,
  FilePdfTwoTone,
  ReloadOutlined,
} from "@ant-design/icons";

const { Paragraph, Text, Link } = Typography;

interface DetailHotelProps {
  open: boolean;
  onClose: () => void;
  data: IHotel | null; 
  onApproved?: () => void; 
}

const statusMap: Record<
  HotelApprovalStatus,
  { color: string; text: string; icon: React.ReactNode }
> = {
  PENDING: {
    color: "orange",
    text: "⏳ Chờ duyệt",
    icon: <ClockCircleTwoTone twoToneColor="#faad14" />,
  },
  APPROVED: {
    color: "green",
    text: "✅ Đã duyệt",
    icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
  },
  SUSPENDED: {
    color: "red",
    text: "🚫 Tạm ngưng",
    icon: <StopTwoTone twoToneColor="#ff4d4f" />,
  },
};

const DetailHotel: React.FC<DetailHotelProps> = ({
  open,
  onClose,
  data,
  onApproved,
}) => {
  const [loading, setLoading] = useState(false);
  const [hotel, setHotel] = useState<IHotel | null>(data);
  const [updating, setUpdating] = useState<HotelApprovalStatus | null>(null);

  const backend = (import.meta.env.VITE_BACKEND_URL as string) || "";

  const buildContractUrl = (filename?: string) =>
    filename ? `${backend}/images/contract/${filename}` : undefined;

  const identityUrl = buildContractUrl(hotel?.identity_doc_filename);
  const contractUrl = buildContractUrl(hotel?.contract_pdf_filename);

  const fetchDetail = useCallback(async () => {
    if (!data?.id) return;
    setLoading(true);
    try {
      const res = await getHotelById(data.id);
      setHotel(res.data ?? null);
    } catch {
      message.error("Không tải được chi tiết khách sạn");
    } finally {
      setLoading(false);
    }
  }, [data?.id]);

  useEffect(() => {
    if (open && data?.id) {
      fetchDetail();
    } else {
      setHotel(data || null);
    }
  }, [open, data?.id, fetchDetail, data]);

  const doApproval = async (status: HotelApprovalStatus) => {
    if (!hotel?.id) return;
    if (hotel.approval_status === status) return;
    try {
      setUpdating(status);
      await updateHotelApproval(hotel.id, status);
      message.success("Cập nhật trạng thái thành công");
      await fetchDetail();
      onApproved?.();
    } catch {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(null);
    }
  };

  const renderStatusTag = (s?: HotelApprovalStatus) => {
    if (!s) return <Tag>Không rõ</Tag>;
    const cfg = statusMap[s];
    return (
      <Tag color={cfg.color}>
        <Space size={6}>
          {cfg.icon}
          <span>{cfg.text}</span>
        </Space>
      </Tag>
    );
  };

  const ActionButtons = () => (
    <Space wrap>
      <Tooltip title="Tải lại">
        <Button icon={<ReloadOutlined />} onClick={fetchDetail} />
      </Tooltip>
      <Popconfirm
        title="Chuyển trạng thái về Chờ duyệt?"
        onConfirm={() => doApproval("PENDING")}
        okText="Xác nhận"
        cancelText="Hủy"
        disabled={loading || hotel?.approval_status === "PENDING"}
      >
        <Button
          disabled={loading || hotel?.approval_status === "PENDING"}
          loading={updating === "PENDING"}
        >
          Chờ duyệt
        </Button>
      </Popconfirm>
      <Popconfirm
        title="Duyệt khách sạn này?"
        onConfirm={() => doApproval("APPROVED")}
        okText="Duyệt"
        cancelText="Hủy"
        disabled={loading || hotel?.approval_status === "APPROVED"}
      >
        <Button
          type="primary"
          disabled={loading || hotel?.approval_status === "APPROVED"}
          loading={updating === "APPROVED"}
        >
          Duyệt
        </Button>
      </Popconfirm>
      <Popconfirm
        title="Tạm ngưng khách sạn này?"
        onConfirm={() => doApproval("SUSPENDED")}
        okText="Tạm ngưng"
        cancelText="Hủy"
        disabled={loading || hotel?.approval_status === "SUSPENDED"}
      >
        <Button
          danger
          disabled={loading || hotel?.approval_status === "SUSPENDED"}
          loading={updating === "SUSPENDED"}
        >
          Tạm ngưng
        </Button>
      </Popconfirm>
    </Space>
  );

  return (
    <Drawer
      title="Chi tiết khách sạn"
      width={860}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={<ActionButtons />}
    >
      {loading ? (
        <div>
          <Skeleton active paragraph={{ rows: 6 }} />
          <Divider />
          <Skeleton.Image active style={{ width: 300, height: 180 }} />
          <div style={{ height: 12 }} />
          <Skeleton.Input active style={{ width: 240 }} />
        </div>
      ) : !hotel ? (
        <Empty description="Không có dữ liệu" />
      ) : (
        <>
          {/* Thông tin cơ bản */}
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            Thông tin cơ bản
          </Typography.Title>
          <Descriptions
            column={2}
            bordered
            size="small"
            labelStyle={{ width: 160 }}
          >
            <Descriptions.Item label="Tên">
              <Text copyable={{ tooltips: ["Sao chép", "Đã sao chép"] }}>
                {hotel.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {renderStatusTag(hotel.approval_status)}
            </Descriptions.Item>

            <Descriptions.Item label="Hạng sao">
              {typeof hotel.star_rating === "number" ? (
                <Rate disabled value={hotel.star_rating} />
              ) : (
                <Text type="secondary">Chưa đánh giá</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian tạo">
              {hotel.created_at
                ? new Date(hotel.created_at).toLocaleString()
                : "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Địa chỉ" span={2}>
              {[
                hotel.address_line,
                hotel.ward_name,
                hotel.district_name,
                hotel.province_name,
              ]
                .filter(Boolean)
                .join(", ") || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}>
                {hotel.description || "-"}
              </Paragraph>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Liên hệ & Pháp lý */}
          <Typography.Title level={5}>Liên hệ & Pháp lý</Typography.Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Descriptions
                title="Thông tin liên hệ"
                size="small"
                bordered
                column={1}
              >
                <Descriptions.Item label="Tên liên hệ">
                  {hotel.contact_name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="SĐT">
                  {hotel.contact_phone ? (
                    <Text copyable>{hotel.contact_phone}</Text>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {hotel.contact_email ? (
                    <Text copyable>{hotel.contact_email}</Text>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <Descriptions title="Pháp lý" size="small" bordered column={1}>
                <Descriptions.Item label="Đơn vị pháp lý">
                  {hotel.legal_name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ pháp lý">
                  {hotel.legal_address || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Người ký">
                  {hotel.signer_full_name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="SĐT người ký">
                  {hotel.signer_phone || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Email người ký">
                  {hotel.signer_email || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider />

          {/* Tài liệu */}
          <Typography.Title level={5}>Tài liệu</Typography.Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Text strong>Ảnh CCCD</Text>
                {identityUrl ? (
                  <Image
                    src={identityUrl}
                    alt="CCCD"
                    width={320}
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 6,
                      boxShadow: "0 1px 2px rgba(0,0,0,.04)",
                    }}
                    placeholder
                  />
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" size={8}>
                <Text strong>Hợp đồng PDF</Text>
                {contractUrl ? (
                  <Button
                    type="default"
                    icon={<FilePdfTwoTone twoToneColor="#fa541c" />}
                    href={contractUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở/Tải hợp đồng
                  </Button>
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </Space>
            </Col>
          </Row>
        </>
      )}
    </Drawer>
  );
};

export default DetailHotel;