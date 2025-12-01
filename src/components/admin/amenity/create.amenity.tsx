// src/components/admin/amenity-category/CreateAmenityCategory.tsx

import { createAmenityCategory } from "@/services/api";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Row,
  Col,
  Tag,
  Space,
  Button,
} from "antd";
import { useState } from "react";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

interface IProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ICreateCategoryForm {
  category: string;
  applies_to: "Hotel" | "Room";
  is_active: boolean;
  amenities: Array<{ name: string }>;
}

const CreateAmenityCategory = (props: IProps) => {
  const { open, onClose, onSuccess } = props;
  const [form] = Form.useForm<ICreateCategoryForm>();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (values: ICreateCategoryForm) => {
    if (!values.amenities || values.amenities.length === 0) {
      message.error("Vui lòng thêm ít nhất 1 tiện ích");
      return;
    }
    const validAmenities = values.amenities.filter(
      (item) => item && item.name && item.name.trim()
    );

    if (validAmenities.length === 0) {
      message.error("Vui lòng nhập tên tiện ích");
      return;
    }

    setLoading(true);
    try {
      const payload: ICreateCategoryPayload = {
        category: values.category.trim(),
        applies_to: values.applies_to,
        is_active: values.is_active ?? true,
        amenities: validAmenities,
      };

      const res = await createAmenityCategory(payload);

      if (res.data) {
        message.success("Tạo loại tiện ích thành công!");
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(res.error || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error?.message || "Tạo thất bại";
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
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          ➕ Tạo loại tiện ích mới
        </div>
      }
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={800}
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
          is_active: true,
          applies_to: "Hotel",
          amenities: [{ name: "" }],
        }}
        style={{ marginTop: 24 }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tên loại tiện ích"
              name="category"
              rules={[
                { required: true, message: "Vui lòng nhập tên loại tiện ích" },
                { min: 3, message: "Tên phải có ít nhất 3 ký tự" },
                { max: 100, message: "Tên không được quá 100 ký tự" },
              ]}
            >
              <Input
                placeholder="VD: Tiện ích cơ bản, Tiện ích cao cấp, Tiện ích giải trí..."
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Áp dụng cho"
              name="applies_to"
              rules={[
                { required: true, message: "Vui lòng chọn loại áp dụng" },
              ]}
            >
              <Select placeholder="Chọn loại" size="large">
                <Option value="Hotel">🏨 Khách sạn</Option>
                <Option value="Room">🛏️ Loại phòng</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Trạng thái"
              name="is_active"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Hoạt động"
                unCheckedChildren="Tắt"
                defaultChecked
                style={{ marginTop: 4 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginBottom: 8, fontWeight: 500 }}>
          Danh sách tiện ích <span style={{ color: "red" }}>*</span>
        </div>

        <Form.List name="amenities">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[
                      { required: true, message: "Vui lòng nhập tên tiện ích" },
                      { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
                    ]}
                    style={{ marginBottom: 0, width: 600 }}
                  >
                    <Input
                      placeholder={`Tiện ích ${
                        index + 1
                      } (VD: WiFi miễn phí, Điều hòa...)`}
                      size="large"
                    />
                  </Form.Item>

                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{
                        color: "red",
                        fontSize: 20,
                        cursor: "pointer",
                      }}
                    />
                  )}
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  size="large"
                  style={{ marginTop: 8 }}
                >
                  Thêm tiện ích
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f0f5ff",
            borderRadius: 6,
            fontSize: 13,
            color: "#666",
          }}
        >
          💡 <strong>Lưu ý:</strong> Mỗi loại tiện ích cần có ít nhất 1 tiện
          ích. Bạn có thể thêm nhiều tiện ích bằng cách nhấn nút "Thêm tiện
          ích".
        </div>
      </Form>
    </Modal>
  );
};

export default CreateAmenityCategory;
