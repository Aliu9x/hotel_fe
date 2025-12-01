import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Radio, Space, Tag, message, Spin, Steps } from "antd";
import dayjs from "dayjs";
import { cancelHold, getBooking, reserveBooking, updatePaymentMethod } from "@/services/api";

type PaymentMethod = "VIETQR" | "PAY_AT_HOTEL";

const STORAGE_KEY = "bookingFlow";

const readFlow = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { bookingId: null, selection: null };
    const parsed = JSON.parse(raw);
    return { bookingId: parsed?.bookingId ?? null, selection: parsed?.selection ?? null };
  } catch {
    return { bookingId: null, selection: null };
  }
};

const BookingStep2: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId, selection } = readFlow();
  const redirectedOnce = useRef(false);

  // Guard: nếu không có bookingId, quay về Step1 hoặc Home (1 lần duy nhất)
  useEffect(() => {
    if (!bookingId && !redirectedOnce.current) {
      redirectedOnce.current = true;
      if (selection) {
        navigate("/booking", { replace: true });
      } else {
        message.warning("Vui lòng thực hiện Bước 1 trước.");
        navigate("/", { replace: true });
      }
    }
  }, [bookingId, selection, navigate]);

  if (!bookingId) return null; // đang chuyển hướng

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [holdInfo, setHoldInfo] = useState<{ reservationCode: string; expiresAt: string } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("VIETQR");
  const [savingPay, setSavingPay] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const b = await getBooking(bookingId);
        setBooking(b);
      } catch {
        message.error("Không tải được booking");
      }
    };
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    const doReserve = async () => {
      if (!booking) return;
      if (booking.status !== "DRAFT") {
        setLoading(false);
        return;
      }
      try {
        const data = await reserveBooking(booking.id);
        setHoldInfo({ reservationCode: data.reservationCode, expiresAt: data.expiresAt });
        const diff = dayjs(data.expiresAt).diff(dayjs(), "second");
        setCountdown(diff);
      } catch (e: any) {
        message.error(e?.response?.data?.message || "Không thể giữ phòng");
      } finally {
        setLoading(false);
      }
    };
    doReserve();
  }, [booking]);

  useEffect(() => {
    if (!holdInfo) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [holdInfo]);

  const fmtCountdown = useCallback(() => {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [countdown]);

  const onlineOnly = booking?.prepay_required === 1;

  const handleBack = async () => {
    if (booking?.status === "HOLD") {
      try {
        await cancelHold(booking.id);
      } catch {}
    }
    navigate("/booking");
  };

  const handleConfirm = async () => {
    if (countdown <= 0) {
      message.error("Giữ phòng đã hết hạn");
      return;
    }
    setSavingPay(true);
    try {
      await updatePaymentMethod(bookingId as number, paymentMethod);
      message.success("Đã lưu phương thức thanh toán (demo)");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Lỗi lưu phương thức");
    } finally {
      setSavingPay(false);
    }
  };

  return (
    <div className="bk-step2-page">
      <div className="bk-step2-container">
        <Steps current={2} />
        {!booking && <Spin />}

        {booking && (
          <div className="bk-step2-grid">
            <div className="bk-payment-col">
              <Card className="bk-hold-banner">
                {loading ? (
                  <Spin />
                ) : booking.status === "HOLD" ? (
                  <Space direction="vertical" size={4}>
                    <div><Tag color="blue">Mã giữ</Tag> {holdInfo?.reservationCode}</div>
                    <div>Hết hạn sau: <Tag color={countdown < 60 ? "red" : "green"}>{fmtCountdown()}</Tag></div>
                  </Space>
                ) : (
                  <div>Trạng thái booking: {booking.status}</div>
                )}
              </Card>

              <Card className="bk-payment-block">
                <h3 className="bk-block-title">Bạn muốn thanh toán thế nào?</h3>
                <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="bk-radio-group">
                  <div className="pay-option">
                    <Radio value="VIETQR">
                      <div className="pay-row">
                        <span className="pay-title">VietQR</span>
                        <Tag color="green">Online nhanh</Tag>
                      </div>
                      <div className="pay-desc">Quét QR để thanh toán tức thì.</div>
                    </Radio>
                  </div>
                  {!onlineOnly && (
                    <div className="pay-option">
                      <Radio value="PAY_AT_HOTEL">
                        <div className="pay-row">
                          <span className="pay-title">Tại khách sạn</span>
                          <Tag color="blue">Trả sau</Tag>
                        </div>
                        <div className="pay-desc">Thanh toán khi nhận phòng.</div>
                      </Radio>
                    </div>
                  )}
                </Radio.Group>
              </Card>

              <Card className="bk-summary-total-block">
                <div className="price-line"><span>Giá phòng</span><span>{Number(booking.total_room_price).toLocaleString("vi-VN")} VND</span></div>
                <div className="price-line"><span>Thuế & phí</span><span>{Number(booking.tax_amount).toLocaleString("vi-VN")} VND</span></div>
                <div className="price-grand"><span>Tổng giá tiền</span><span className="grand-value">{Number(booking.grand_total).toLocaleString("vi-VN")} VND</span></div>
                <Space style={{ marginTop: 16 }}>
                  <Button onClick={handleBack}>Trở về</Button>
                  <Button type="primary" disabled={booking.status !== "HOLD" || countdown <= 0 || savingPay} onClick={handleConfirm}>
                    {savingPay ? "Đang lưu..." : "Xác nhận phương thức"}
                  </Button>
                </Space>
              </Card>
            </div>

            <div className="bk-summary-col">
              <Card className="bk-summary-side">
                <h4 className="side-title">Tóm tắt</h4>
                <div className="side-hotel-name">Hotel #{selection?.hotelId}</div>
                <div className="side-dates">Nhận: {booking.checkin_date} • Trả: {booking.checkout_date} • {booking.nights} đêm</div>
                <div className="side-room">(x{booking.rooms}) RoomType {selection?.roomTypeId} - RatePlan {selection?.ratePlanId}</div>
                <div className="side-guests">👤 {booking.adults} NL {booking.children > 0 && <> • 👶 {booking.children} TE</>}</div>
                <div className="side-policy">{booking.prepay_required === 1 ? <Tag color="volcano">Yêu cầu thanh toán trước</Tag> : <Tag color="blue">Trả sau được</Tag>}</div>
                <div className="side-contact">Liên hệ: {booking.contact_name} • {booking.contact_email}</div>
                <div className="side-guest">Khách lưu trú: {booking.guest_name}</div>
                {booking.special_requests && <div className="side-requests">Yêu cầu: {JSON.parse(booking.special_requests).join(", ")}</div>}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingStep2;