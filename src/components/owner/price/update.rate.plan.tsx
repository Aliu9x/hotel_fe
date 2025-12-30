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
import { useEffect, useMemo, useState } from "react";
import {
  getAllRatePlanCategory,
  getRoomType,
  updateRatePlan,
} from "@/services/api";

const { Option } = Select;
const { TextArea } = Input;

interface IProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: IRatePlan | null;
  roomTypes: IRoomType[];
}

type RatePlanCategory = {
  id: number;
  name: string;
};

const UpdateRatePlan = ({
  open,
  onClose,
  onSuccess,
  data,
  roomTypes,
}: IProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rtList, setRtList] = useState<IRoomType[]>(roomTypes || []);
  const [categories, setCategories] = useState<RatePlanCategory[]>([]);
  const [roomMaxOccupancy, setRoomMaxOccupancy] = useState<number | undefined>(
    undefined
  );
console.log(roomMaxOccupancy)
  useEffect(() => {
    if (!open) return;

    const fetchInit = async () => {
      try {
        if (!roomTypes || roomTypes.length === 0) {
          const qs = new URLSearchParams();
          qs.append("page", "1");
          qs.append("limit", "200");
          const resRT = await getRoomType(qs.toString());
          setRtList(resRT?.data?.result || []);
        } else {
          setRtList(roomTypes);
        }

        const resCat = await getAllRatePlanCategory();
        setCategories(resCat?.data || []);
      } catch (_e) {
      }
    };

    fetchInit();
  }, [open, roomTypes]);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        room_type_id: data.room_type_id,
        rate_plan_category_id:
          data.rate_plan_category_id != null
            ? String(data.rate_plan_category_id)
            : undefined,
        price_amount:
          data.price_amount != null ? Number(data.price_amount) : undefined,
        description: data.description,
        base_occupancy: data.base_occupancy,
        max_occupancy: data.max_occupancy,
        extra_adult_fee:
          data.extra_adult_fee != null ? Number(data.extra_adult_fee) : 0,
        extra_child_fee:
          data.extra_child_fee != null ? Number(data.extra_child_fee) : 0,
        prepayment_required: !!data.prepayment_required,
      });

      const rt = (roomTypes?.length ? roomTypes : rtList).find(
        (r) => r.id === data.room_type_id
      );
      setRoomMaxOccupancy(rt?.max_occupancy);
    } else {
      form.resetFields();
      setRoomMaxOccupancy(undefined);
    }
  }, [open, data, rtList]);

  const handleOk = () => form.submit();

  const onFinish = async (v: any) => {
    if (!data) return;
    setLoading(true);
    try {
      const payload: IUpdateRatePlanPayload = {
        room_type_id: v.room_type_id,
        rate_plan_category_id: v.rate_plan_category_id,
        price_amount: String(v.price_amount),
        description: v.description?.trim(),
        base_occupancy: v.base_occupancy,
        max_occupancy: v.max_occupancy,
        extra_adult_fee: String(v.extra_adult_fee ?? 0),
        extra_child_fee: String(v.extra_child_fee ?? 0),
        prepayment_required: !!v.prepayment_required,
      };

      const res = await updateRatePlan(data.id, payload);
      if (res?.statusCode === 200) {
        message.success("Cập nhật gói giá thành công");
        onSuccess();
        onClose();
      } else {
        message.error(res?.error || "Cập nhật thất bại");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onChangeRoomType = (value: number) => {
    const room = (roomTypes?.length ? roomTypes : rtList).find(
      (rt) => Number(rt.id_category) === value
    );
    if (room) {
      setRoomMaxOccupancy(room.max_occupancy);
      const base = form.getFieldValue("base_occupancy");
      const max = form.getFieldValue("max_occupancy");
      if (base > room.max_occupancy) {
        form.setFieldValue("base_occupancy", room.max_occupancy);
      }
      if (max > room.max_occupancy) {
        form.setFieldValue("max_occupancy", room.max_occupancy);
      }
    }
  };

  const occupancyValidators = useMemo(
    () => ({
      base: [
        { required: true, message: "Nhập số khách cơ bản" },
        () => ({
          validator(_: any, value: number) {
            if (roomMaxOccupancy !== undefined && value > roomMaxOccupancy) {
              return Promise.reject(
                new Error("Không được vượt quá số khách tối đa của phòng")
              );
            }
            return Promise.resolve();
          },
        }),
      ],
      max: [
        { required: true, message: "Nhập số khách tối đa" },
        ({ getFieldValue }: any) => ({
          validator(_: any, value: number) {
            if (roomMaxOccupancy !== undefined && value > roomMaxOccupancy) {
              return Promise.reject(
                new Error("Không được vượt quá số khách tối đa của phòng")
              );
            }
            if (value < getFieldValue("base_occupancy")) {
              return Promise.reject(
                new Error("Số khách tối đa phải ≥ số khách cơ bản")
              );
            }
            return Promise.resolve();
          },
        }),
      ],
    }),
    [roomMaxOccupancy]
  );

  return (
    <Modal
      title="Cập nhật gói giá"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={loading}
      width={860}
      destroyOnClose
      centered
    >
      {!data ? null : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            base_occupancy: 1,
            max_occupancy: 1,
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
                rules={[
                  { required: true, message: "Vui lòng chọn loại phòng" },
                ]}
              >
                <Select
                  placeholder="Chọn loại phòng"
                  onChange={onChangeRoomType}
                >
                  {(roomTypes?.length ? roomTypes : rtList).map((rt) => (
                    <Option key={rt.id} value={rt.id}>
                      {rt.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Gói giá"
                name="rate_plan_category_id"
                rules={[{ required: true, message: "Vui lòng chọn gói giá" }]}
              >
                <Select
                  placeholder="Chọn gói giá"
                  options={categories.map((item) => ({
                    label: item.name,
                    value: String(item.id), // giữ nguyên style như CreateRatePlan
                  }))}
                />
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
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Số khách cơ bản"
                name="base_occupancy"
                rules={occupancyValidators.base as any}
              >
                <InputNumber
                  min={1}
                  max={roomMaxOccupancy}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Số khách tối đa"
                name="max_occupancy"
                rules={occupancyValidators.max as any}
              >
                <InputNumber
                  min={1}
                  max={roomMaxOccupancy}
                  style={{ width: "100%" }}
                />
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
      )}
    </Modal>
  );
};

export default UpdateRatePlan;
