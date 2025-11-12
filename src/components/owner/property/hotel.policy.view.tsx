import {
  Form,
  Input,
  TimePicker,
  Button,
  Divider,
  Space,
  Card,
  Row,
  Col,
  Typography,
  App,
} from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { createOrUpdateHotelPolicies, getHotelPolicies } from "@/services/api";
import { useEffect, useState } from "react";

const { Paragraph, Text } = Typography;

const timeFormat = "HH:mm:ss";
const HotelPolicyView = () => {
  const [form] = Form.useForm<IHotelPolicy>();
  const [viewHotelPolicy, setViewHotelPolicy] = useState<IHotelPolicy>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();


  const mapDataToForm = (data?: IHotelPolicy) => {
    if (!data) return {};
    return {
      ...data,
      default_checkin_time: data?.default_checkin_time
        ? dayjs(data.default_checkin_time, timeFormat)
        : undefined,
      default_checkout_time: data?.default_checkout_time
        ? dayjs(data.default_checkout_time, timeFormat)
        : undefined,
    };
  };

  const mapFormToPayload = (values: IHotelPolicy): IHotelPolicy => {
    return {
      ...values,
      default_checkin_time: values?.default_checkin_time
        ? dayjs(values.default_checkin_time).format(timeFormat)
        : undefined,
      default_checkout_time: values?.default_checkout_time
        ? dayjs(values.default_checkout_time).format(timeFormat)
        : undefined,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getHotelPolicies();
        const data = res?.data;
        if (data) {
          setViewHotelPolicy(data);
          form.setFieldsValue(mapDataToForm(data));
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (e) {
        message.error("Không thể tải chính sách khách sạn");
        setIsEditing(true);
      }
    };
    fetchData();
  }, [form]);

  const onFinish = async (values: IHotelPolicy) => {
    try {
      setLoading(true);
      const payload = mapFormToPayload(values);
      const res = await createOrUpdateHotelPolicies(payload);
      const saved = res?.data ?? payload;

      setViewHotelPolicy(saved);
      form.setFieldsValue(mapDataToForm(saved));
      message.success(
        viewHotelPolicy ? "Cập nhật thành công!" : "Tạo mới thành công!"
      );
      setIsEditing(false);
    } catch (error) {
      message.error("Đã xảy ra lỗi khi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Khôi phục giá trị form theo data hiện có và về chế độ xem
    form.setFieldsValue(mapDataToForm(viewHotelPolicy));
    setIsEditing(false);
  };

  const isCreating = !viewHotelPolicy; // Chưa có data thì là tạo mới

  return (
    <Card
      hoverable
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        borderRadius: 14,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
      headStyle={{ padding: "16px 20px" }}
      bodyStyle={{ padding: 20 }}
      title={
        <Space size="small" align="center">
          <FileTextOutlined style={{ color: "#1677ff" }} />
          <Text strong style={{ fontSize: 16 }}>
            Chính sách khách sạn
          </Text>
        </Space>
      }
      extra={
        viewHotelPolicy && !isEditing ? (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            Chỉnh sửa
          </Button>
        ) : null
      }
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Paragraph type="secondary" style={{ marginBottom: 8 }}>
          Quản lý giờ nhận/trả phòng và các chính sách lưu trú áp dụng tại khách
          sạn.
        </Paragraph>

        <Divider style={{ margin: "8px 0 16px" }} />

        <Form
          form={form}
          layout="vertical"
          initialValues={{}} // Dùng setFieldsValue sau khi load data để đảm bảo đồng bộ
          onFinish={onFinish}
          disabled={!isEditing}
        >
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="default_checkin_time"
                label="Giờ nhận phòng"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ nhận phòng" },
                ]}
                extra={<Text type="secondary">Định dạng 24h, ví dụ 14:00</Text>}
              >
                <TimePicker
                  format="HH:mm"
                  minuteStep={15}
                  style={{ width: "100%" }}
                  placeholder="Chọn giờ nhận phòng"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="default_checkout_time"
                label="Giờ trả phòng"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ trả phòng" },
                ]}
                extra={<Text type="secondary">Định dạng 24h, ví dụ 12:00</Text>}
              >
                <TimePicker
                  format="HH:mm"
                  minuteStep={15}
                  style={{ width: "100%" }}
                  placeholder="Chọn giờ trả phòng"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="house_rules" label="Nội quy khách sạn">
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              showCount
              maxLength={1000}
              placeholder="Ví dụ: Giờ yên lặng 22:00–06:00; không tổ chức tiệc; không hút thuốc trong phòng..."
              allowClear
            />
          </Form.Item>

          <Form.Item name="children_policy" label="Chính sách trẻ em">
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              showCount
              maxLength={1000}
              placeholder="Ví dụ: Dưới 6 tuổi miễn phí nếu ở chung giường; 6–11 tuổi phụ thu..."
              allowClear
            />
          </Form.Item>

          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item name="smoking_policy" label="Chính sách hút thuốc">
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 5 }}
                  showCount
                  maxLength={800}
                  placeholder="Ví dụ: Cấm hút thuốc trong phòng; phạt vệ sinh 2.000.000đ nếu vi phạm..."
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="pets_policy" label="Chính sách thú cưng">
                <Input.TextArea
                  autoSize={{ minRows: 7, maxRows: 5 }}
                  showCount
                  maxLength={800}
                  placeholder="Ví dụ: Cho phép thú cưng <10kg, phụ phí 200.000đ/đêm; dùng dây dắt khu vực chung..."
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="other_policies" label="Chính sách khác">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 5 }}
              showCount
              maxLength={800}
              placeholder="Ví dụ: Cọc lưu trú 500.000đ/phòng; chính sách hủy; bãi đỗ xe giới hạn..."
              allowClear
            />
          </Form.Item>

          {isEditing && (
            <Form.Item style={{ marginTop: 8 }}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }} wrap>
                {viewHotelPolicy && (
                  <Button onClick={handleCancelEdit} size="large">
                    Hủy
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  shape="round"
                >
                  {isCreating ? "Tạo mới" : "Lưu"}
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Space>
    </Card>
  );
};

export default HotelPolicyView;
