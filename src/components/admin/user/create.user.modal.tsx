import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import type { Role } from "@/types/file.constants";
import { createUserApi } from "@/services/api";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  role: Role; 
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
  onClose,
  onSuccess,
  role,
}) => {
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
        role,
      });
      message.success("Tạo tài khoản thành công");
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

  const handleCancel = () => {
    if (!submitting) {
      form.resetFields();
      onClose();
    }
  };

  const modalTitle =
    role === "HOTEL_OWNER"
      ? "Thêm người dùng (Chủ khách sạn)"
      : "Thêm người dùng (Khách hàng)";

  return (
    <Modal
      title={modalTitle}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      destroyOnClose
      okText="Tạo mới"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ full_name: "", email: "", password: "", phone: "" }}
      >
        <Form.Item
          label="Họ và tên"
          name="full_name"
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên" },
            { max: 255, message: "Tối đa 255 ký tự" },
          ]}
        >
          <Input placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: "email", message: "Email không hợp lệ" },
            { max: 255, message: "Tối đa 255 ký tự" },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 6, message: "Tối thiểu 6 ký tự" },
            { max: 128, message: "Tối đa 128 ký tự" },
          ]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ max: 50, message: "Tối đa 50 ký tự" }]}
        >
          <Input placeholder="09xxxxxxxx" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;