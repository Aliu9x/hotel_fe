import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Form,
  Checkbox,
  Tag,
  Card,
  Divider,
  message,
  Steps,
} from "antd";
import { createBooking } from "@/services/api";
import "@/components/layout/app.header.scss";


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
const writeBookingId = (id: number) => {
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

  // Nếu vào /booking mà chưa có selection → về trang chủ (1 lần)
  useEffect(() => {
    if (!selection && !redirectedOnce.current) {
      redirectedOnce.current = true;
      message.warning("Vui lòng chọn gói giá trước.");
      navigate("/", { replace: true });
    }
  }, [selection, navigate]);

  if (!selection) return null; // đang chuyển hướng

  const [contactForm] = Form.useForm();
  const [guestForm] = Form.useForm();
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const nights = useMemo(() => {
    const ci = new Date(selection.checkin);
    const co = new Date(selection.checkout);
    return Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
  }, [selection]);

  const totalRoomPrice = selection.price * nights * selection.rooms;
  const taxFee = Math.round(totalRoomPrice * 0.15);
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

      writeBookingId(booking.id);
      navigate("/booking/comfirm");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không thể tạo booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bk-step1-page global-container">
      <div className="bk-step1-container">
        <Steps current={1000} />
        <div className="bk-grid">
          <div className="bk-left" >
            <Card className="bk-block" style={{ margin:"0 auto"}} >
              <h3 className="bk-block-title">Liên hệ đặt chỗ</h3>
              <Form form={contactForm} layout="vertical">
                <Form.Item
                  name="contactName"
                  label="Họ tên*"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Tên liên hệ" />
                </Form.Item>
                <Form.Item
                  name="contactEmail"
                  label="Email*"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input placeholder="email@..." />
                </Form.Item>
                <Form.Item
                  name="contactPhone"
                  label="Điện thoại*"
                  rules={[{ required: true }]}
                >
                  <Input addonBefore="+84" placeholder="Số điện thoại" />
                </Form.Item>
                <Form.Item name="selfBook" valuePropName="checked" initialValue>
                  <Checkbox>Tôi đặt cho chính mình</Checkbox>
                </Form.Item>
              </Form>
            </Card>

            <Card className="bk-block">
              <h3 className="bk-block-title">Thông tin khách lưu trú</h3>
              <Form form={guestForm} layout="vertical">
                <Form.Item
                  name="guestName"
                  label="Họ tên khách*"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Tên khách" />
                </Form.Item>
              </Form>
            </Card>

            <Card className="bk-block">
              <h3 className="bk-block-title">Yêu cầu đặc biệt</h3>
              <div className="bk-special-grid">
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
                  Tầng cao
                </Checkbox>
                <Checkbox
                  checked={specialRequests.includes("lateCheckin")}
                  onChange={() => toggleReq("lateCheckin")}
                >
                  Nhận phòng muộn
                </Checkbox>
              </div>
            </Card>

            {/* <Card className="bk-block">
              <h3 className="bk-block-title">Chính sách Chỗ ở</h3>
              <div className="bk-policy-item">
                <Tag color="blue">Lưu ý</Tag> Xuất trình CCCD / Passport khi nhận phòng
              </div>
              <div className="bk-policy-item">
                <Tag color="gold">Giấy tờ</Tag> Mang giấy tờ tùy thân hợp lệ
              </div>
            </Card> */}
          </div>

          <div className="bk-right">
            <Card className="bk-summary-block">
              <div className="bk-summary-section">
                <Tag color="cyan">
                  {selection.rooms} phòng • {nights} đêm
                </Tag>
                {selection.promo && <Tag color="blue">{selection.promo}</Tag>}
              </div>
              <Divider />
              <div className="bk-summary-section">
                <div>Nhận: {selection.checkin}</div>
                <div>Trả: {selection.checkout}</div>
                <div>
                  Khách: {selection.adults} NL{" "}
                  {selection.children > 0 && `, ${selection.children} TE`}
                </div>
                <div>RatePlan: {selection.ratePlanId}</div>
                {selection.prepayRequired ? (
                  <Tag color="volcano">Yêu cầu thanh toán trước</Tag>
                ) : (
                  <Tag color="green">Có thể thanh toán tại khách sạn</Tag>
                )}
              </div>
              <Divider />
              <div className="bk-price-detail">
                <div className="bk-price-row">
                  <span>Giá phòng</span>
                  <span>{totalRoomPrice.toLocaleString("vi-VN")} VND</span>
                </div>
                <div className="bk-price-row">
                  <span>Thuế & phí</span>
                  <span>{taxFee.toLocaleString("vi-VN")} VND</span>
                </div>
                <div className="bk-price-total">
                  <span>Tổng cộng</span>
                  <span className="bk-grand">
                    {grandTotal.toLocaleString("vi-VN")} VND
                  </span>
                </div>
              </div>
              <Button type="primary" block size="large" loading={true}>
                {/* onClick={handleContinue} */}
                Tiếp tục
              </Button>
              <div className="bk-terms">
                Tiếp tục nghĩa là bạn đồng ý Điều khoản & Chính sách.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStep1;
