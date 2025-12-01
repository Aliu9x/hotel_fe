import React, { useEffect, useMemo } from "react";
import { Modal, Form, InputNumber, Switch, Space, Typography } from "antd";

const { Text } = Typography;

export interface InventoryAdjustModalProps {
  open: boolean;
  loading?: boolean;
  inventory?: IInventory | null;
  onCancel: () => void;
  onSubmit: (payload: IAdjustInventoryPayload) => Promise<void> | void;
}

export const InventoryAdjustModal: React.FC<InventoryAdjustModalProps> = ({
  open,
  loading,
  inventory,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<IAdjustInventoryPayload>();

  // Reset form khi inventory thay đổi / modal mở
  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  // Theo dõi mọi field để biết người dùng đã nhập gì chưa
  const watchAll = Form.useWatch([], form);
  const hasAnyValue = useMemo(() => {
    if (!watchAll) return false;
    return Object.values(watchAll).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
  }, [watchAll]);

  const handleFinish = async (values: IAdjustInventoryPayload) => {
    // Log để chắc onSubmit được gọi
    // eslint-disable-next-line no-console
    console.log("[InventoryAdjustModal] submit payload:", values);
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={
        <Space direction="vertical" size={0}>
          <Text strong>Điều chỉnh tồn kho</Text>
          <Text type="secondary">
            {inventory
              ? `Ngày ${inventory.inventoryDate} • Total ${inventory.totalRooms} • Avail ${inventory.availableRooms} • Blocked ${inventory.blockedRooms} • Sold ${inventory.roomsSold}`
              : "Chưa có bản ghi cho ngày này"}
          </Text>
        </Space>
      }
      onCancel={onCancel}
      okText="Lưu"
      // Dùng form.submit để kích hoạt validate + onFinish
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
      okButtonProps={{ disabled: !hasAnyValue }} // Không cho Lưu khi chưa nhập gì
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Text strong>Gán cứng (override)</Text>
        <Form.Item name="overrideTotalRooms" label="Total rooms">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="overrideAvailableRooms" label="Available rooms">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="overrideBlockedRooms" label="Blocked rooms">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="overrideRoomsSold" label="Rooms sold">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Text strong>Điều chỉnh (delta)</Text>
        <Form.Item name="deltaTotalRooms" label="Δ Total rooms">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="deltaAvailableRooms" label="Δ Available rooms">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="deltaBlockedRooms" label="Δ Blocked rooms">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="deltaRoomsSold" label="Δ Rooms sold">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="stopSell" label="Stop sell" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
