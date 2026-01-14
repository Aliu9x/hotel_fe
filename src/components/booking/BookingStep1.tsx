import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Form, Checkbox, App } from "antd";
import "./bookingStep1.css";
import {
  geRatePlanById,
  getBooking,
  getHotelById,
  getRoomTypeById,
  updateBooking,
} from "@/services/api";

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

const readSelectionId = (): any => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.bookingId;
  } catch {
    return null;
  }
};

const BookingStep1: React.FC = () => {
  const navigate = useNavigate();
  const selection = readSelection();
  const idBooking = readSelectionId();
  const redirectedOnce = useRef(false);
  const { message } = App.useApp();
  const [hotel, setHotel] = useState<any>(null);
  const [nrt, setNrt] = useState<any>(null);
  const [nrp, setNrp] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  useEffect(() => {
    const getBookings = async () => {
      const res = await getBooking(idBooking);
      if (res && res.data) {
        setBooking(res.data);
        const h = await getHotelById(res.data.hotel_id);
        if (h && h.data) {
          setHotel(h.data);
        }
        const rt = await getRoomTypeById(res.data.room_type_id);
        if (rt && rt.data) {
          setNrt(rt.data);
        }
        const rp = await geRatePlanById(res.data.rate_plan_id);
        if (rp && rp.data) {
          setNrp(rp.data);
        }
      }
    };
    getBookings();
  }, []);

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
    const days = Math.round(
      (co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 1;
  }, [selection]);

  const toggleReq = (v: string) => {
    setSpecialRequests((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };
  useEffect(() => {
    if (!booking) return;

    contactForm.setFieldsValue({
      contactName: booking.contact_name,
      contactEmail: booking.contact_email,
      contactPhone: booking.contact_phone,
      selfBook: booking.is_self_book === 1,
    });

    guestForm.setFieldsValue({
      guestName: booking.guest_name,
    });
  }, [booking, contactForm, guestForm]);
  const handleContinue = async () => {
    try {
      await contactForm.validateFields();
      await guestForm.validateFields();
      setLoading(true);
      const c = contactForm.getFieldsValue();
      const g = guestForm.getFieldsValue();

      const booking = await updateBooking(
        {
          contactName: c.contactName,
          contactEmail: c.contactEmail,
          contactPhone: c.contactPhone,
          isSelfBook: c.selfBook ? 1 : 0,
          total_price: selection.price,
          promoTag: selection.promo,
          guestName: g.guestName,
        },
        idBooking
      );
      navigate("/booking/confirm", {
        replace: true,
        state: { dataBooking: booking?.data, n: hotel },
      });
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
              {hotel?.name}
              {/* <span className="s1-rating">9.5/10</span>
              <span className="s1-reviews">(362 đánh giá)</span> */}
            </div>
          </div>
          <div className="s1-steps">
            <span>Xem lại</span>
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
            <div className="s1-section-sub">
              Thêm liên hệ để nhận xác nhận đặt chỗ.
            </div>
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
              <div className="s1-hotel-note">
                Bạn có lựa chọn tuyệt vời cho kỳ nghỉ của mình.
              </div>
              <div className="s1-room-title">
                {nrt?.name} - {nrp?.name}{" "}
              </div>
              <div className="s1-stay-info">
                <div>
                  Nhận phòng: <b>{selection.checkin}</b>
                </div>
                <div>
                  Trả phòng: <b>{selection.checkout}</b>
                </div>
                <div>
                  {selection.adults} khách , {selection.children} trẻ em
                </div>
              </div>
              {/* <div className="s1-policies">
                <div>Miễn phí hủy phòng trước 17 thg 12 2025</div>
                <div>Có thể đổi lịch</div>
              </div> */}
            </div>

            <div className="s1-price-card">
              <div className="s1-price-row">
                <span>Giá phòng </span>
                <span>{selection.price.toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="s1-price-row">
                <span>Thuế và phí</span>
                <span>0 VND</span>
              </div>
              <div className="s1-price-row">
                <div>
                  <div>Tổng cộng</div>
                  <div>
                    {" "}
                    {selection.rooms} phòng • {nights} đêm
                  </div>
                </div>

                <div className="s1-grand">
                  {selection.price.toLocaleString("vi-VN")} VND
                </div>
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
                Bằng cách tiến tục thanh toán, bạn đã đồng ý với Điều khoản,
                Chính sách bảo mật và Quy trình Hoàn tiền lưu trú.
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default BookingStep1;
