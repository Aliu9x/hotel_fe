import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Form,
  Checkbox,
  App,
} from "antd";
import { createBooking } from "@/services/api";
import "./bookingStep1.css";

type Selection = {
  hotelId: number;
  roomTypeId: number;
  ratePlanId: number;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  price: number;
  prepayRequired: boolean;
  promo?: string;
};

const STORAGE_KEY = "bookingFlow";

const readSelection = (): Selection | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.selection ?? null;
  } catch {
    return null;
  }
};

const writeBookingId = (id: string | number) => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const json = raw ? JSON.parse(raw) : {};
    json.bookingId = id;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  } catch {}
};

const BookingStep1: React.FC = () => {
  const navigate = useNavigate();
  const selection = readSelection();
  const redirectedOnce = useRef(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (!selection && !redirectedOnce.current) {
      redirectedOnce.current = true;
      message.warning("Vui lòng chọn gói giá trước.");
      navigate("/", { replace: true });
    }
  }, [selection, navigate]);

  if (!selection) return null;

  const [contactForm] = Form.useForm();
  const [guestForm] = Form.useForm();
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const nights = useMemo(() => {
    const ci = new Date(selection.checkin);
    const co = new Date(selection.checkout);
    const days = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [selection]);

  const totalRoomPrice = selection.price * nights * selection.rooms;
  const taxFee = Math.round(totalRoomPrice * 0.155); 
  const grandTotal = totalRoomPrice + taxFee;

  const toggleReq = (v: string) => {
    setSpecialRequests((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const handleContinue = async () => {
    try {
      await contactForm.validateFields();
      await guestForm.validateFields();
      setLoading(true);
      const c = contactForm.getFieldsValue();
      const g = guestForm.getFieldsValue();

      const booking = await createBooking({
        hotelId: selection.hotelId,
        roomTypeId: selection.roomTypeId,
        ratePlanId: selection.ratePlanId,
        checkin: selection.checkin,
        checkout: selection.checkout,
        adults: selection.adults,
        children: selection.children,
        rooms: selection.rooms,
        contactName: c.contactName,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        isSelfBook: c.selfBook ? 1 : 0,
        guestName: g.guestName,
        specialRequests,
        pricePerNight: selection.price,
        prepayRequired: selection.prepayRequired ? 1 : 0,
        promoTag: selection.promo,
      });

      const bookingId = booking?.data?.id;
      writeBookingId(String(bookingId));

      navigate("/booking/confirm", { replace: true });
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || e?.message || "Không thể tạo booking"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="s1-page">
      <header className="s1-header">
        <div className="s1-header-inner">
          <div className="s1-brand">
            <img
              // src="https://seeklogo.com/images/T/traveloka-logo-91AA3D6650-seeklogo.com.png"
              // className="s1-logo"
            />
            <div className="s1-hotel-title">
              Mia Saigon Luxury Boutique Hotel
              {/* <span className="s1-rating">9.5/10</span>
              <span className="s1-reviews">(362 đánh giá)</span> */}
            </div>
          </div>
          <div className="s1-steps">
            <span>Thanh toán</span>
          </div>
        </div>
      </header>

      <main className="s1-main">
        <div className="s1-left">
          {/* Liên hệ đặt chỗ */}
          <section className="s1-section">
            <div className="s1-section-title">
              <span className="s1-section-icon">✉️</span>
              Liên hệ đặt chỗ
            </div>
            <div className="s1-section-sub">Thêm liên hệ để nhận xác nhận đặt chỗ.</div>
            <Form form={contactForm} layout="vertical">
              <Form.Item
                name="contactName"
                label="Họ tên*"
                rules={[{ required: true }]}
              >
                <Input placeholder="như trên CMND (không dấu)" />
              </Form.Item>
              <div className="s1-row-2">
                <Form.Item
                  name="contactPhone"
                  label="Điện thoại di động*"
                  rules={[{ required: true }]}
                >
                  <Input addonBefore="+84" placeholder="+84 901234567" />
                </Form.Item>
                <Form.Item
                  name="contactEmail"
                  label="Email*"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input placeholder="email@example.com" />
                </Form.Item>
              </div>
              <Form.Item name="selfBook" valuePropName="checked" initialValue>
                <Checkbox>Tôi đặt chỗ cho chính mình</Checkbox>
              </Form.Item>
            </Form>
          </section>

          {/* Thông tin khách hàng */}
          <section className="s1-section">
            <div className="s1-section-title">
              <span className="s1-section-icon">👤</span>
              Thông tin Khách hàng
            </div>
            <div className="s1-section-sub">
              Vui lòng điền đầy đủ các thông tin để nhận xác nhận đơn hàng
            </div>
            <Form form={guestForm} layout="vertical">
              <Form.Item
                name="guestName"
                label="Họ tên khách*"
                rules={[{ required: true }]}
              >
                <Input placeholder="Tên khách" />
              </Form.Item>
            </Form>
          </section>

          {/* Yêu cầu đặc biệt */}
          <section className="s1-section">
            <div className="s1-section-title">
              <span className="s1-section-icon">⭐</span>
              Yêu cầu đặc biệt
            </div>
            <div className="s1-special-grid">
              <Checkbox
                checked={specialRequests.includes("nonSmoking")}
                onChange={() => toggleReq("nonSmoking")}
              >
                Phòng không hút thuốc
              </Checkbox>
              <Checkbox
                checked={specialRequests.includes("highFloor")}
                onChange={() => toggleReq("highFloor")}
              >
                Phòng liền kề
              </Checkbox>
              <Checkbox
                checked={specialRequests.includes("lateCheckin")}
                onChange={() => toggleReq("lateCheckin")}
              >
                Tầng lâu
              </Checkbox>
            </div>
          </section>
        </div>

        {/* Right column */}
        <aside className="s1-right">
          <div className="s1-hotel-card">
            <div className="s1-hotel-card-top">
              <div className="s1-hotel-note">Bạn có lựa chọn tuyệt vời cho kỳ nghỉ của mình.</div>
              <div className="s1-room-title">
                (1x) Deluxe King River Front - A Symphony Of Art & Wellness Package
              </div>
              <div className="s1-stay-info">
                <div>
                  Nhận phòng: <b>{selection.checkin}</b>
                </div>
                <div>
                  Trả phòng: <b>{selection.checkout}</b>
                </div>
                <div>
                  {selection.adults} khách • {nights} đêm • {selection.rooms} phòng
                </div>
              </div>
              <div className="s1-policies">
                <div>Miễn phí hủy phòng trước 17 thg 12 2025</div>
                <div>Có thể đổi lịch</div>
              </div>
            </div>

            <div className="s1-price-card">
              <div className="s1-price-row">
                <span>Giá phòng</span>
                <span>{totalRoomPrice.toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="s1-price-row">
                <span>Thuế và phí</span>
                <span>{taxFee.toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="s1-price-total">
                <div className="s1-strike">12.000.000 VND</div>
                <div className="s1-grand">{grandTotal.toLocaleString("vi-VN")} VND</div>
              </div>
              <Button
                className="s1-cta"
                type="primary"
                block
                size="large"
                loading={loading}
                onClick={handleContinue}
              >
                Tiếp tục
              </Button>
              <div className="s1-terms">
                Bằng cách tiến tục thanh toán, bạn đã đồng ý với Điều khoản, Chính sách bảo mật và Quy trình Hoàn tiền lưu trú.
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default BookingStep1;