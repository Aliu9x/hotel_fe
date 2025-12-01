import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import "./layout.partner.scss";

const LayoutPartner: React.FC = () => {
  const navigate = useNavigate();

  const handleListAsset = () => {
    navigate("/register", {
      state: { role: "HOTEL_OWNER" },
      replace: false,
    });
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="partner-page">
      <header className="partner-header">
        <div className="partner-brand">
          <span className="brand-title">Aliu</span>
          <span className="brand-sub">TERA</span>
        </div>
        <div className="partner-actions">
          <Button type="link" className="header-link">
            Cần trợ giúp?
          </Button>
          <Button type="link" className="header-link">
            Tiếng Anh ▾
          </Button>
          <Button className="header-login" onClick={handleLogin}>
            Đăng nhập
          </Button>
        </div>
      </header>

      <section className="partner-hero">
        <div className="hero-left">
          <h1 className="hero-title">
            Thêm mạng lưới của chúng tôi
            <br />
            vào giá trị tài sản rộng
            <br />
            của bạn
          </h1>
          <p className="hero-sub">
            Mở cửa chào đón hàng triệu du khách tiềm năng đến{" "}
            <a href="#" className="hero-link">
              lưu trú tại đây
            </a>
            .
          </p>
          <Button type="primary" className="hero-cta" onClick={handleListAsset}>
            Liệt kê tài sản của bạn
          </Button>
        </div>

        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80&auto=format&fit=crop"
            alt="Partner Hero"
            className="hero-image"
          />
        </div>
      </section>

      <section className="partner-logos">
        <div className="logos-title">Đối tác nổi tiếng của chúng tôi</div>
        <div className="logos-row">
          <img
            src="https://dummyimage.com/120x40/ffffff/999999&text=ARCHIPELAGO"
            alt="Archipelago"
          />
          <img
            src="https://dummyimage.com/120x40/ffffff/999999&text=IHG"
            alt="IHG"
          />
          <img
            src="https://dummyimage.com/160x40/ffffff/999999&text=Swiss-Belhotel"
            alt="Swiss-Belhotel"
          />
          <img
            src="https://dummyimage.com/120x40/ffffff/999999&text=artotel"
            alt="artotel"
          />
          <img
            src="https://dummyimage.com/140x40/ffffff/999999&text=d'primahotel"
            alt="d'primahotel"
          />
        </div>
      </section>
    </div>
  );
};

export default LayoutPartner;
