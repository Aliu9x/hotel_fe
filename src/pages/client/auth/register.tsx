import {
  Button,
  Form,
  Input,
  Card,
  Typography,
  message,
  type FormProps,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import React, { useMemo, useState } from "react";
import { registerApi } from "@/services/api";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const { Title } = Typography;

type FieldType = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
};

type RoleType = "CUSTOMER" | "HOTEL_OWNER" | string;

export const RegisterPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const roleFromState = (location.state as any)?.role as RoleType | undefined;
  const roleFromQuery = (searchParams.get("role") as RoleType) || undefined;
  const role: RoleType = useMemo(
    () => roleFromState || roleFromQuery || "CUSTOMER",
    [roleFromState, roleFromQuery]
  );

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { phone, email, name, password } = values;
    try {
      setIsSubmitting(true);
      const res = await registerApi(email, password, phone, name, role);
      if (res?.data) {
        message.success(
          role === "HOTEL_OWNER"
            ? "Đăng ký đối tác khách sạn thành công"
            : "Đăng ký người dùng thành công"
        );
        if (role === "HOTEL_OWNER") {
          navigate("/login", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } else {
        message.error(res?.error || "Đăng ký thất bại, thử lại sau.");
      }
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || e?.message || "Có lỗi xảy ra khi đăng ký."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = () => {
    message.error("Vui lòng kiểm tra lại các trường thông tin.");
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
          maxWidth: 480,
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          backdropFilter: "blur(8px)",
          background: "rgba(255, 255, 255, 0.96)",
        }}
        styles={{
          body: {
            padding: "36px 30px",
          },
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <Title level={2} style={{ color: "#333", marginBottom: 6 }}>
            {role === "HOTEL_OWNER"
              ? "Đăng ký Đối tác Khách sạn"
              : "Đăng Ký Tài Khoản"}
          </Title>
          <p style={{ color: "#777", fontSize: 14 }}>
            {role === "HOTEL_OWNER"
              ? "Tạo tài khoản đối tác để liệt kê tài sản của bạn."
              : "Tạo tài khoản mới để bắt đầu hành trình của bạn ✨"}
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

          <Form.Item label="Mật khẩu" name="password">
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

          {/* <Form.Item style={{ marginBottom: 0 }}>
            <span style={{ fontSize: 12, color: "#888" }}>
              Vai trò đăng ký: <b>{role}</b>
            </span>
          </Form.Item> */}

          <Form.Item style={{ marginTop: 20 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmitting}
              style={{
                height: 45,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                boxShadow: "0 4px 14px rgba(118, 75, 162, 0.3)",
              }}
            >
              Đăng Ký
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <span style={{ color: "#666" }}>Đã có tài khoản?</span>
            <a
              href={role === "HOTEL_OWNER" ? "/login" : "/login"}
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

export default RegisterPage;
