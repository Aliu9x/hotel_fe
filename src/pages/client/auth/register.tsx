import {
  Button,
  Form,
  FormProps,
  Input,
  Card,
  Typography,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { registerApi } from "@/services/api";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

type FieldType = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
};
export const RegisterPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { phone, email, name, password } = values;
    const res = await registerApi(email, password, phone, name);
    if (res.data) {
      message.success("Đăng ký người dung thành công");
      setIsSubmit(true);
      navigate("/login");
      console.log(res.data);
    } else {
      message.error(res.error);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 450,
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          backdropFilter: "blur(8px)",
          background: "rgba(255, 255, 255, 0.95)",
        }}
        styles={{
          body: {
            padding: "40px 30px",
          },
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Title level={2} style={{ color: "#333", marginBottom: 5 }}>
            Đăng Ký Tài Khoản
          </Title>
          <p style={{ color: "#777", fontSize: 15 }}>
            Tạo tài khoản mới để bắt đầu hành trình của bạn ✨
          </p>
        </div>

        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên!" },
              { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#667eea" }} />}
              placeholder="Nhập họ và tên"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#667eea" }} />}
              placeholder="Nhập địa chỉ email"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại phải có 10-11 chữ số!",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: "#667eea" }} />}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#667eea" }} />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#667eea" }} />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 30 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmit}
              style={{
                height: 45,
                fontSize: 16,
                fontWeight: 500,
                borderRadius: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                boxShadow: "0 4px 14px rgba(118, 75, 162, 0.3)",
              }}
            >
              Đăng Ký
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: 15 }}>
            <span style={{ color: "#666" }}>Đã có tài khoản?</span>
            <a
              href="/login"
              style={{
                marginLeft: 6,
                fontWeight: 600,
                color: "#667eea",
                textDecoration: "none",
              }}
            >
              Đăng nhập ngay
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};
