import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Rate,
  Row,
  Col,
  Button,
  message,
} from "antd";
import {
  createHotel,
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/api";
import { HotelApprovalStatus } from "@/types/file.constants";

const { TextArea } = Input;
const { Option } = Select;

interface IProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateHotel: React.FC<IProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm<ICreateHotelPayload>();
  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const province_id = Form.useWatch("province_id", form);
  const district_id = Form.useWatch("district_id", form);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProvinces({ limit: 500 });
        const payload = res.data;
        setProvinces(
          (payload?.result || []).map((p: any) => ({
            label: `${p.type} - ${p.name}`,
            value: p.id,
          }))
        );
      } catch {
        message.error("Không tải được tỉnh");
      }
    })();
  }, []);

  useEffect(() => {
    if (!province_id) {
      setDistricts([]);
      form.setFieldsValue({ district_id: undefined, ward_id: undefined });
      setWards([]);
      return;
    }
    (async () => {
      try {
        const res = await getDistricts({
          provinceId: province_id,
          limit: 2000,
        });
        const payload = res.data;
        setDistricts(
          (payload?.result || []).map((d: any) => ({
            label: `${d.type} - ${d.name}`,
            value: d.id,
          }))
        );
        form.setFieldsValue({ district_id: undefined, ward_id: undefined });
        setWards([]);
      } catch {
        message.error("Không tải được quận/huyện");
      }
    })();
  }, [province_id]);

  useEffect(() => {
    if (!district_id) {
      setWards([]);
      form.setFieldsValue({ ward_id: undefined });
      return;
    }
    (async () => {
      try {
        const res = await getWards({ districtId: district_id, limit: 3000 });
        const payload = res.data;
        setWards(
          (payload?.result || []).map((w: any) => ({
            label: `${w.type} - ${w.name}`,
            value: w.id,
          }))
        );
        form.setFieldsValue({ ward_id: undefined });
      } catch {
        message.error("Không tải được phường/xã");
      }
    })();
  }, [district_id]);

  const handleSubmit = async (values: ICreateHotelPayload) => {
    setLoading(true);
    try {
      const payload: ICreateHotelPayload = {
        name: values.name.trim(),
        description: values.description?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim(),
        address_line: values.address_line?.trim(),
        province_id: values.province_id,
        district_id: values.district_id,
        ward_id: values.ward_id,
        city: values.city?.trim(), // nếu vẫn cho nhập city tự do
        star_rating: values.star_rating,
        country_code: values.country_code || "VN",
        timezone: values.timezone || "Asia/Ho_Chi_Minh",
        approval_status: values.approval_status,
      };

      const res = await createHotel(payload);
      if (res.data) {
        message.success("Tạo khách sạn thành công!");
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(res.error || "Tạo thất bại");
      }
    } catch (e: any) {
      message.error(e?.message || "Lỗi tạo khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          ➕ Tạo khách sạn mới
        </div>
      }
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={900}
      okText="Tạo mới"
      cancelText="Hủy"
      destroyOnClose
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          country_code: "VN",
          timezone: "Asia/Ho_Chi_Minh",
          approval_status: HotelApprovalStatus.PENDING,
        }}
        style={{ marginTop: 8 }}
      >
        <div
          style={{
            marginBottom: 16,
            fontSize: 15,
            fontWeight: 600,
            color: "#1890ff",
          }}
        >
          📋 Thông tin cơ bản
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên khách sạn"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên khách sạn" },
                { min: 3, message: "Tên phải ≥ 3 ký tự" },
                { max: 255, message: "Tên ≤ 255 ký tự" },
              ]}
            >
              <Input placeholder="VD: Hilton Hanoi Opera" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Hạng sao"
              name="star_rating"
              tooltip="Đánh giá (1-5)"
            >
              <Rate allowClear style={{ fontSize: 26 }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", message: "Email không hợp lệ" }]}
            >
              <Input placeholder="info@hotel.com" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Số điện thoại" name="phone">
              <Input placeholder="024 3933 0500" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Mô tả" name="description">
          <TextArea placeholder="Mô tả ngắn..." rows={3} />
        </Form.Item>

        <div
          style={{
            marginBottom: 8,
            marginTop: 24,
            fontSize: 15,
            fontWeight: 600,
            color: "#1890ff",
          }}
        >
          📍 Địa chỉ
        </div>
        <Form.Item label="Địa chỉ chi tiết" name="address_line">
          <Input placeholder="Số nhà, đường..." size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Tỉnh/Thành phố" name="province_id">
              <Select
                allowClear
                showSearch
                placeholder="Chọn tỉnh"
                options={provinces}
                size="large"
              
                filterOption={(input, option) =>
                  (option?.label as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Quận/Huyện" name="district_id">
              <Select
                allowClear
                showSearch
                disabled={!province_id}
                placeholder="Chọn quận/huyện"
                options={districts}
                size="large"
                filterOption={(input, option) =>
                  (option?.label as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Phường/Xã" name="ward_id">
              <Select
                allowClear
                showSearch
                disabled={!district_id}
                placeholder="Chọn phường/xã"
                options={wards}
                size="large"
                filterOption={(input, option) =>
                  (option?.label as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Mã quốc gia" name="country_code">
              <Select size="large">
                <Option value="VN">🇻🇳 Việt Nam (VN)</Option>
                <Option value="US">🇺🇸 United States (US)</Option>
                <Option value="JP">🇯🇵 Japan (JP)</Option>
                <Option value="KR">🇰🇷 Korea (KR)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Múi giờ" name="timezone">
              <Select size="large">
                <Option value="Asia/Ho_Chi_Minh">
                  Asia/Ho_Chi_Minh (GMT+7)
                </Option>
                <Option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</Option>
                <Option value="Asia/Singapore">Asia/Singapore (GMT+8)</Option>
                <Option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>


        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#f0f5ff",
            borderRadius: 6,
            fontSize: 13,
            color: "#666",
          }}
        >
        </div>

      </Form>
    </Modal>
  );
};

export default CreateHotel;
