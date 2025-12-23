import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  type FormProps,
  App,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { loginApi } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useCurrentApp } from "@/components/context/app.context";

const { Title } = Typography;

type FieldType = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const { message } = App.useApp();
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser, user } = useCurrentApp();
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { email, password } = values;
    setIsSubmit(true);
    const res = await loginApi(email, password);
    if (res.data) {
      setIsAuthenticated(true), setUser(res.data.user);
      localStorage.setItem("access_token", res.data.access_token);
      message.success(res.message);
      if (user?.role === "ADMIN") {
        navigate("/admin");
      }
      if (user?.role === "HOTEL_OWNER") {
        navigate("/partner/dashboard");
      }
    } else {
      message.error(res.message);
    }

    setIsSubmit(false);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card styles={{ body: { padding: "40px 30px" } }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Title level={2} style={{ margin: 0, color: "#333" }}>
            Đăng Nhập
          </Title>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Nhập thông tin tài khoản của bạn
          </p>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#1890ff" }} />}
              placeholder="Nhập email của bạn"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: "30px" }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmit}
              style={{
                height: "45px",
                fontSize: "16px",
                fontWeight: "500",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <span style={{ color: "#666" }}>Chưa có tài khoản?</span>
            <a
              href="/register"
              style={{ marginLeft: "5px", fontWeight: "500" }}
            >
              Đăng ký ngay
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
