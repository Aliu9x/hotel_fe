import { createRatePlan } from "@/services/api";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  InputNumber,
  Switch,
  message,
} from "antd";
import { useState } from "react";

const { Option } = Select;
const { TextArea } = Input;

interface IProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomTypes: IRoomType[];
}

const CreateRatePlan = ({ open, onClose, onSuccess, roomTypes }: IProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = () => form.submit();

  const onFinish = async (v: any) => {
    setLoading(true);
    try {
      const payload: Omit<ICreateRatePlanPayload, "hotel_id"> & {
        hotel_id?: string;
      } = {
        room_type_id: v.room_type_id,
        name: v.name.trim(),
        price_amount: String(v.price_amount),
        description: v.description?.trim(),
        meal_plan: v.meal_plan,
        type: v.type,
        base_occupancy: v.base_occupancy,
        max_occupancy: v.max_occupancy,
        extra_adult_fee: String(v.extra_adult_fee ?? 0),
        extra_child_fee: String(v.extra_child_fee ?? 0),
        prepayment_required: !!v.prepayment_required,
      };
      const res = await createRatePlan(payload as any);
      if (res.statusCode === 201) {
        message.success("Tạo gói giá thành công");
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(res.error || "Tạo gói giá thất bại");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Tạo gói giá thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo gói giá"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Tạo mới"
      cancelText="Hủy"
      confirmLoading={loading}
      width={860}
      destroyOnClose
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type: "REFUNDABLE",
          base_occupancy: 2,
          max_occupancy: 2,
          extra_adult_fee: 0,
          extra_child_fee: 0,
          prepayment_required: false,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại phòng"
              name="room_type_id"
              rules={[{ required: true, message: "Vui lòng chọn loại phòng" }]}
            >
              <Select placeholder="Chọn loại phòng">
                {roomTypes.map((rt) => (
                  <Option key={rt.id} value={rt.id}>
                    {rt.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tên gói giá"
              name="name"
              rules={[{ required: true, message: "Nhập tên gói giá" }]}
            >
              <Input placeholder="Ví dụ: Linh hoạt / Không hoàn hủy..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giá mỗi đêm (VND)"
              name="price_amount"
              rules={[{ required: true, message: "Nhập giá" }]}
            >
              <InputNumber
                min={0}
                step={10000}
                style={{ width: "100%" }}
                placeholder="Ví dụ: 1,200,000"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Gói bữa ăn" name="meal_plan">
              <Select allowClear placeholder="Chọn hoặc để trống">
                <Option value="NONE">Không</Option>
                <Option value="BREAKFAST">Bữa sáng</Option>
                <Option value="HALF_BOARD">Bữa sáng + Bữa tối</Option>
                <Option value="FULL_BOARD">3 bữa</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại hoàn/hủy"
              name="type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="REFUNDABLE">Hoàn/Hủy linh hoạt</Option>
                <Option value="NON_REFUNDABLE">Không hoàn hủy</Option>
                <Option value="SEMI_FLEX">Bán linh hoạt</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Số khách cơ bản"
              name="base_occupancy"
              rules={[{ required: true, message: "Nhập số khách cơ bản" }]}
            >
              <InputNumber min={1} max={10} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Số khách tối đa"
              name="max_occupancy"
              rules={[{ required: true, message: "Nhập số khách tối đa" }]}
            >
              <InputNumber min={1} max={10} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Phụ thu người lớn" name="extra_adult_fee">
              <InputNumber
                min={0}
                step={10000}
                style={{ width: "100%" }}
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Phụ thu trẻ em" name="extra_child_fee">
              <InputNumber
                min={0}
                step={5000}
                style={{ width: "100%" }}
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Yêu cầu thanh toán trước"
              name="prepayment_required"
              valuePropName="checked"
              tooltip="Bật nếu khách phải thanh toán trước để giữ phòng"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Mô tả" name="description">
          <TextArea
            rows={3}
            placeholder="Thông tin chi tiết về gói giá (tùy chọn)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRatePlan;
