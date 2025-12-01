import { Modal, Form, Input, Select, Row, Col, InputNumber, Switch, App } from 'antd';
import { useEffect, useState } from 'react';
import { getRoomType, updateRatePlan } from '@/services/api';

const { Option } = Select;
const { TextArea } = Input;

interface IProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: IRatePlan | null;
  roomTypes: IRoomType[];
}

const UpdateRatePlan = ({ open, onClose, onSuccess, data, roomTypes }: IProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rtList, setRtList] = useState<IRoomType[]>(roomTypes);
  const {  message } = App.useApp();
  useEffect(() => {
    if (!open) return;
    if (roomTypes.length > 0) {
      setRtList(roomTypes);
      return;
    }
    const fetchRoomTypes = async () => {
      const qs = new URLSearchParams();
      qs.append('page', '1');
      qs.append('limit', '200');
      try {
        const res = await getRoomType(qs.toString());
        setRtList(res.data?.result || []);
      } catch {
      }
    };
    fetchRoomTypes();
  }, [open, roomTypes]);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        room_type_id: data.room_type_id,
        name: data.name,
        price_amount: Number(data.price_amount),
        description: data.description,
        meal_plan: data.meal_plan,
        type: data.type,
        base_occupancy: data.base_occupancy,
        max_occupancy: data.max_occupancy,
        extra_adult_fee: Number(data.extra_adult_fee),
        extra_child_fee: Number(data.extra_child_fee),
        prepayment_required: data.prepayment_required,
      });
    } else {
      form.resetFields();
    }
  }, [open, data, form]);

  const handleOk = () => form.submit();

  const onFinish = async (v: any) => {
    if (!data) return;
    setLoading(true);
    try {
      const payload: IUpdateRatePlanPayload = {};
      const simpleKeys = [
        'room_type_id',
        'name',
        'description',
        'meal_plan',
        'type',
      ] as const;
      simpleKeys.forEach(k => {
        if (v[k] !== undefined && v[k] !== null && v[k] !== '') {
          payload[k] = v[k];
        }
      });
      if (v.price_amount !== undefined) payload.price_amount = String(v.price_amount);
      if (v.base_occupancy !== undefined) payload.base_occupancy = v.base_occupancy;
      if (v.max_occupancy !== undefined) payload.max_occupancy = v.max_occupancy;
      if (v.extra_adult_fee !== undefined) payload.extra_adult_fee = String(v.extra_adult_fee);
      if (v.extra_child_fee !== undefined) payload.extra_child_fee = String(v.extra_child_fee);
      if (v.prepayment_required !== undefined) payload.prepayment_required = !!v.prepayment_required;

      const res = await updateRatePlan(data.id, payload);
      if (res.statusCode === 200) {
        message.success('Cập nhật gói giá thành công');
        onSuccess();
        onClose();
      } else {
        message.error(res.error || 'Cập nhật thất bại');
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

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
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại phòng"
                name="room_type_id"
                rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
              >
                <Select placeholder="Chọn loại phòng">
                  {rtList.map(rt => (
                    <Option key={rt.id} value={rt.id}>{rt.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tên gói giá" name="name" rules={[{ required: true, message: 'Nhập tên gói' }]}>
                <Input placeholder="Nhập tên gói giá" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giá mỗi đêm (VND)"
                name="price_amount"
                rules={[{ required: true, message: 'Nhập giá' }]}
              >
                <InputNumber
                  min={0}
                  step={10000}
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 1,500,000"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Gói bữa ăn" name="meal_plan">
                <Select allowClear placeholder="Chọn gói bữa ăn">
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
              <Form.Item label="Loại hoàn/hủy" name="type" rules={[{ required: true }]}>
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
                rules={[{ required: true, message: 'Nhập số khách cơ bản' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Số khách tối đa"
                name="max_occupancy"
                rules={[{ required: true, message: 'Nhập số khách tối đa' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Phụ thu người lớn" name="extra_adult_fee">
                <InputNumber min={0} step={10000} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phụ thu trẻ em" name="extra_child_fee">
                <InputNumber min={0} step={5000} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Yêu cầu thanh toán trước"
                name="prepayment_required"
                valuePropName="checked"
                tooltip="Bật nếu cần khách thanh toán trước để giữ phòng"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={3} placeholder="Thông tin chi tiết về gói giá (tùy chọn)" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateRatePlan;