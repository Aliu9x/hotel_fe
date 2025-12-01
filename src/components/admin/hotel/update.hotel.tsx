// src/components/admin/hotel/update.hotel.tsx

import { updateHotel } from "@/services/api";
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Spin,
  Rate,
} from "antd";
import { useState, useEffect } from "react";

const { Option } = Select;
const { TextArea } = Input;

interface IProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: IHotel | null;
}

interface IUpdateHotelForm {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address_line?: string;
  ward?: string;
  district?: string;
  city?: string;
  province?: string;
  country_code?: string;
  timezone?: string;
  approval_status?: "PENDING" | "APPROVED" | "SUSPENDED";
}

const UpdateHotel = (props: IProps) => {
  const { open, onClose, onSuccess, data } = props;
  const [form] = Form.useForm<IHotel>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        address_line: data.address_line,
        ward: data.ward,
        district: data.district,
        city: data.city,
        star_rating: data.star_rating,
        province: data.province,
        country_code: data.country_code,
        timezone: data.timezone,
        approval_status: data.approval_status,
      });
    }
  }, [open, data, form]);

  const handleSubmit = async (values: IHotel) => {
    if (!data) return;
    try {
      const payload: IHotel = {
        id: values.id,
        name: values.name?.trim(),
        description: values.description?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim(),
        address_line: values.address_line?.trim(),
        ward: values.ward?.trim(),
        district: values.district?.trim(),
        city: values.city?.trim(),
        province: values.province?.trim(),
        country_code: values.country_code,
        timezone: values.timezone,
        approval_status: values.approval_status,
      };
      if (values.star_rating !== undefined) {
        payload.star_rating = values.star_rating;
      }
      const res = await updateHotel(data.id, payload);
      if (res.data && res) {
        message.success("Cập nhật khách sạn thành công!");
        onSuccess();
        onClose();
      } else {
        message.error(res.error || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error?.message || "Cập nhật thất bại";
      message.error(errorMsg);
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
        <div style={{ fontSize: 18, fontWeight: 600 }}>✏️ Duyệt khách sạn </div>
      }
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={900}
      okText="Duyệt"
      cancelText="Hủy"
      destroyOnClose
      centered
    >
      {!data ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Row>
            <Col span={20}>
              <Form.Item label="Trạng thái" name="approval_status">
                <Select placeholder="Chọn trạng thái" size="large">
                  <Option value="PENDING">⏳ Chờ duyệt</Option>
                  <Option value="APPROVED">✅ Đã duyệt</Option>
                  <Option value="SUSPENDED">🚫 Tạm ngưng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateHotel;
