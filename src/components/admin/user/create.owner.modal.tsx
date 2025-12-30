import React, { useState } from "react";
import { Modal, Form, Input, message, Select } from "antd";
import { createUserApi } from "@/services/api";
import { UserStatus } from "@/types/file.constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const CreateOwnerModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await createUserApi({
        full_name: values.full_name.trim(),
        email: values.email?.trim(),
        password: values.password,
        phone: values.phone?.trim(),
        role: "HOTEL_OWNER",
      });
      message.success("Tạo tài khoản chủ khách sạn thành công");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || "Tạo tài khoản thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Thêm người dùng (Chủ khách sạn)"
      open={open}
      onOk={handleOk}
      onCancel={() => !submitting && (form.resetFields(), onClose())}
      confirmLoading={submitting}
      destroyOnClose
      okText="Tạo mới"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          full_name: "",
          email: "",
          password: "",
          phone: "",
          status: UserStatus.APPROVED,
        }}
      >
        <Form.Item
          label="Họ và tên"
          name="full_name"
          rules={[{ required: true }, { max: 255 }]}
        >
          <Input placeholder="Nguyễn Văn B" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: "email" }, { max: 255 }]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true }, { min: 6 }, { max: 128 }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ max: 50 }]}>
          <Input placeholder="09xxxxxxxx" />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: UserStatus.APPROVED, label: "APPROVED" },
              { value: UserStatus.SUSPENDED, label: "SUSPENDED" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateOwnerModal;
