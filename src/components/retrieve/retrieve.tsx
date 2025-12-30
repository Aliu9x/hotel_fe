import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Empty,
  Form,
  Input,
  Space,
  Menu,
  Divider,
  Tag,
  Skeleton,
  Descriptions,
  message,
  Modal,
  App,
} from "antd";
import {
  ReadOutlined,
  BellOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { cancelBooking, fetchAccountApi, getMyBooking } from "@/services/api";
import "./retrieve.scss";
import type { ActionType } from "@ant-design/pro-components";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const CONTAINER_MAX_WIDTH = 1140; // tương đương vùng nội dung của header
const H_PADDING = 16; // padding ngang giống header
const BLOCK_GUTTER = 16; // khoảng cách giữa các khối
const CARD_PADDING = 16; // padding trong card
const SIDER_WIDTH = 260; // thu hẹp sidebar

export default function Retrieve() {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message, modal, notification } = App.useApp();
  const [account, setAccount] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Helpers
  const formatCurrency = (v?: string | number) =>
    typeof v === "number" || (typeof v === "string" && v !== "")
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(v))
      : "--";

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "--";
  const statusTagColor = (s?: string) => {
    switch (s) {
      case "CONFIRMED":
        return "blue";
      case "PENDING":
        return "orange";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const paymentLabel = (p?: string) => {
    switch (p) {
      case "PAY_AT_HOTEL":
        return "Thanh toán tại khách sạn";
      case "ONLINE":
        return "Thanh toán online";
      default:
        return p || "Không xác định";
    }
  };

  const hasAccount = useMemo(() => !!account, [account]);

  const fetchAccount = async () => {
    try {
      setLoadingAccount(true);
      const res = await fetchAccountApi();
      if (res?.data) {
        setAccount(res.data);
        // Có tài khoản -> ẩn phần tìm kiếm (điều kiện ở render)
      } else {
        setAccount(null);
      }
    } catch (e) {
      setAccount(null);
    } finally {
      setLoadingAccount(false);
    }
  };

  const fetchMyBooking = async () => {
    try {
      setLoadingBookings(true);
      const res = await getMyBooking();
      if (res?.data) {
        console.log("Đây là data trả ra", res.data);
        const list = Array.isArray(res.data) ? res.data : [res.data];
        setBookings(list.filter(Boolean));
      } else {
        setBookings([]);
      }
    } catch (e) {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchAccount();
    fetchMyBooking();
  }, []);

  const onSearch = async (values: any) => {
    // Nếu cần, gọi API tìm đặt chỗ theo mã và email/phone
    // Hiện tại giữ nguyên vì yêu cầu chính là ẩn phần tìm kiếm khi có account
    console.log("Tìm đặt chỗ với:", values);
  };

  const menuItems = [
    { key: "my-bookings", icon: <ReadOutlined />, label: "Đặt chỗ của tôi" },
    { key: "alerts", icon: <BellOutlined />, label: "Thông báo" },
  ];

  const BookingCard = ({ b }: { b: any }) => {
    const hotel = b?.hotel || {};
    const roomType = b?.roomType || {};
    const ratePlan = b?.ratePlan || {};

    const han = async (id: string) => {
      modal.confirm({
        title: "Xác nhận hủy đặt phòng",
        content: "Bạn có chắc chắn muốn hủy đơn đặt phòng này không?",
        okText: "Hủy phòng",
        cancelText: "Không",
        okType: "danger",
        async onOk() {
          try {
            const res = await cancelBooking(id);
            if (res.data) {
              message.success("Bạn đã hủy phòng thành công");
              actionRef.current?.reload();
            }
          } catch (err: any) {
            message.error(err?.response?.data?.message || "Hủy phòng thất bại");
          }
        },
      });
    };
    return (
      <Card className="booking-card" bodyStyle={{ padding: CARD_PADDING }}>
        {/* Header */}
        <div className="booking-card__header">
          <div className="booking-card__title">
            <HomeOutlined />
            <div className="booking-card__title-text">
              <Text className="booking-card__hotel-name">
                {hotel?.name || "Khách sạn"}
              </Text>
              {hotel?.star_rating ? (
                <Tag color="gold">{`${hotel.star_rating}★`}</Tag>
              ) : null}
              <Tag color={statusTagColor(b?.status)}>
                {b?.status || "STATUS"}
              </Tag>
            </div>
          </div>

          <div className="booking-card__meta">
            <Tag color="geekblue">
              Mã đặt chỗ: {b?.reservation_code || "--"}
            </Tag>
            <Tag color="blue">{paymentLabel(b?.payment_type)}</Tag>
          </div>
        </div>

        {/* Info grid */}
        <Row gutter={[12, 12]} className="booking-card__grid">
          <Col xs={24} md={14}>
            <Card className="booking-card__section" bordered={false}>
              <div className="booking-card__section-title">
                <CalendarOutlined />
                <Text strong>Thông tin lưu trú</Text>
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Nhận phòng">
                  {formatDate(b?.checkin_date)}
                </Descriptions.Item>
                <Descriptions.Item label="Trả phòng">
                  {formatDate(b?.checkout_date)}
                </Descriptions.Item>
                <Descriptions.Item label="Số đêm">
                  {b?.nights ?? "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Số phòng">
                  {b?.rooms ?? 1}
                </Descriptions.Item>
                <Descriptions.Item label="Khách">
                  <Space size={8}>
                    <UserOutlined />
                    <span>
                      {b?.adults ?? 0} người lớn
                      {typeof b?.children === "number"
                        ? `, ${b.children} trẻ em`
                        : ""}
                    </span>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="booking-card__section" bordered={false}>
              <div className="booking-card__section-title">
                <EnvironmentOutlined />
                <Text strong>Khách sạn</Text>
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tên">
                  {hotel?.name || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {hotel?.address_line || "--"}
                  {hotel?.district_name ? `, ${hotel.district_name}` : ""}
                  {hotel?.province_name ? `, ${hotel.province_name}` : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Liên hệ">
                  {hotel?.contact_name || "--"} · {hotel?.contact_phone || "--"}{" "}
                  · {hotel?.contact_email || "--"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card className="booking-card__section" bordered={false}>
              <div className="booking-card__section-title">
                <Text strong>Phòng & gói giá</Text>
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Loại phòng">
                  {roomType?.name || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Giường">
                  {roomType?.bed_config || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Diện tích">
                  {roomType?.room_size_label
                    ? `${roomType.room_size_label} m²`
                    : "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Tầng">
                  {roomType?.floor_level || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Hút thuốc">
                  {roomType?.smoking_allowed ? "Có" : "Không"}
                </Descriptions.Item>
                <Descriptions.Item label="View">
                  {roomType?.view || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Gói giá">
                  {ratePlan?.name || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Giá gói">
                  <Space>
                    <DollarCircleOutlined />
                    <span>
                      {formatCurrency(ratePlan?.price_amount || b?.total_price)}
                    </span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Thanh toán">
                  {paymentLabel(b?.payment_type)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="booking-card__section" bordered={false}>
              <div className="booking-card__section-actions">
                <Space wrap>
                  <Button type="primary" onClick={() => han(b.id)}>
                    Hủy phòng
                  </Button>
                </Space>
                <Text type="secondary">
                  Đặt ngày: {formatDate(b?.created_at)}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        maxWidth: CONTAINER_MAX_WIDTH,
        margin: "0 auto",
        padding: `0 ${H_PADDING}px`,
      }}
      className="account-content"
    >
      {/* KHÔNG có header theo yêu cầu */}
      <Sider
        width={SIDER_WIDTH}
        style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
        breakpoint="lg"
        collapsedWidth={0}
      >
        <div style={{ padding: 12 }}>
          <Divider style={{ margin: "12px 0" }} />
          <Menu
            mode="inline"
            defaultSelectedKeys={["my-bookings"]}
            items={menuItems}
          />
        </div>
      </Sider>

      <Layout style={{ background: "transparent" }}>
        <Content style={{ padding: H_PADDING }}>
          <Row gutter={[BLOCK_GUTTER, BLOCK_GUTTER]}>
            {/* Khối tìm kiếm: CHỈ hiển thị khi KHÔNG có dữ liệu tài khoản */}
            {!hasAccount && (
              <Col span={24}>
                <Title level={3} style={{ marginBottom: 8 }}>
                  Vé điện tử & phiếu thanh toán hiện hành
                </Title>

                <Card
                  style={{ borderRadius: 12 }}
                  bodyStyle={{ padding: CARD_PADDING }}
                >
                  <Row gutter={[BLOCK_GUTTER, BLOCK_GUTTER]}>
                    <Col xs={24} md={12}>
                      <Title level={5} style={{ marginBottom: 8 }}>
                        Tìm đặt chỗ của bạn
                      </Title>

                      <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ bookingCode: "", emailOrPhone: "" }}
                        onFinish={onSearch}
                      >
                        <Form.Item
                          label="Mã đặt chỗ"
                          name="bookingCode"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mã đặt chỗ",
                            },
                            { len: 6, message: "Mã đặt chỗ gồm 6 ký tự" },
                          ]}
                        >
                          <Input placeholder="VD: ABC123" maxLength={6} />
                        </Form.Item>

                        <Form.Item
                          label="Email hoặc Số điện thoại"
                          name="emailOrPhone"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập email hoặc số điện thoại",
                            },
                          ]}
                        >
                          <Input placeholder="you@example.com hoặc 0901234567" />
                        </Form.Item>

                        <Space size={8}>
                          <Button type="primary" htmlType="submit">
                            Tìm đặt chỗ
                          </Button>
                          <Button htmlType="reset">Làm mới</Button>
                        </Space>
                      </Form>
                    </Col>
                  </Row>
                </Card>
              </Col>
            )}

            {/* Kết quả/đơn đặt */}
            <Col span={24}>
              <Title level={3} style={{ marginBottom: 8 }}>
                Kết quả tìm kiếm
              </Title>
              <Card
                style={{ borderRadius: 12 }}
                bodyStyle={{ padding: CARD_PADDING }}
              >
                {loadingBookings ? (
                  <Skeleton active />
                ) : bookings.length === 0 ? (
                  <Col xs={24} md={12}>
                    <Empty
                      description={
                        <div>
                          <Title level={5} style={{ marginBottom: 0 }}>
                            Không tìm thấy đặt chỗ
                          </Title>
                          <Text>Mọi chỗ bạn đặt sẽ được hiển thị tại đây.</Text>
                        </div>
                      }
                    />
                  </Col>
                ) : (
                  <Space
                    direction="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    {bookings.map((b) => (
                      <BookingCard
                        key={`${b?.id}-${b?.reservation_code}`}
                        b={b}
                      />
                    ))}
                  </Space>
                )}
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}
