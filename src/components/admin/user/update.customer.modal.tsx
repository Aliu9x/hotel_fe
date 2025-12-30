import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Select } from "antd";
import { UserStatus } from "@/types/file.constants";
import { updateUserApi } from "@/services/api";

interface Props {
  open: boolean;
  user?: IUser;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateCustomerModal: React.FC<Props> = ({
  open,
  user,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        full_name: user.full_name,
        email: user.email || "",
        phone: user.phone || "",
        status: user.status || UserStatus.APPROVED,
        password: "",
      });
    } else {
      form.resetFields();
    }
  }, [open, user, form]);

  const handleOk = async () => {
    if (!user) {
      message.warning("Không có dữ liệu người dùng để cập nhật");
      return;
    }
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await updateUserApi(user.id, {
        full_name: values.full_name.trim(),
        email: values.email?.trim() || null,
        status: values.status,
        ...(values.password ? { password: values.password } : {}),
        role: "CUSTOMER",
      });
      message.success("Cập nhật khách hàng thành công");
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa người dùng (Khách hàng)"
      open={open}
      onOk={handleOk}
      onCancel={() => !submitting && onClose()}
      confirmLoading={submitting}
      destroyOnClose
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Họ và tên"
          name="full_name"
          rules={[{ required: true }, { max: 255 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: "email" }, { max: 255 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ max: 50 }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: UserStatus.APPROVED, label: "ACTIVE" },
              { value: UserStatus.SUSPENDED, label: "SUSPENDED" },
            ]}
          />
        </Form.Item>
        {/* <Form.Item
          label="Mật khẩu (để trống nếu không đổi)"
          name="password"
          rules={[{ min: 6, message: "Tối thiểu 6 ký tự" }, { max: 128 }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

export default UpdateCustomerModal;
