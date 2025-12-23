import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Radio, Space, Tag, message, Spin, Steps } from "antd";
import dayjs from "dayjs";
import {
  cancelHold,
  getBooking,
  reserveBooking,
  startMomoPayment,
} from "@/services/api";
import "./bookingStep2.css";

type PaymentMethod = "MOMO" | "PAY_AT_HOTEL";

const STORAGE_KEY = "bookingFlow";

const readFlow = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { bookingId: null, selection: null };
    const parsed = JSON.parse(raw);
    return {
      bookingId: parsed?.bookingId ?? null,
      selection: parsed?.selection ?? null,
    };
  } catch {
    return { bookingId: null, selection: null };
  }
};

const BookingStep2: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId, selection } = readFlow();
  const redirectedOnce = useRef(false);
  ``;
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

  if (!bookingId) return null;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [holdInfo, setHoldInfo] = useState<{
    reservationCode: string;
    expiresAt: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOMO");
  const [savingPay, setSavingPay] = useState(false);
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const b = await getBooking(bookingId);
        setBooking(b.data);
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
        setBooking((prev: any) => (prev ? { ...prev, status: "HOLD" } : prev));
        setHoldInfo({
          reservationCode: data.reservationCode,
          expiresAt: data.expiresAt,
        });
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
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [holdInfo]);

  useEffect(() => {
    let timer: any;
    async function pollStatus() {
      try {
        const resp = await getBooking(String(bookingId));
        const latest = resp?.data ?? resp; 
        setBooking(latest);
        if (latest?.status === "PAID") {
          try {
            sessionStorage.removeItem("bookingFlow");
          } catch {}
          message.success("Thanh toán thành công!");
          navigate("/", { replace: true });
        }
      } catch {}
    }
    timer = setInterval(pollStatus, 3000);
    return () => clearInterval(timer);
  }, [bookingId, navigate]);

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
    if (paymentMethod !== "MOMO") {
      message.info("Bạn đã chọn thanh toán trực tiếp tại khách sạn.");
      return;
    }
    if (holdInfo && countdown <= 0) {
      message.error("Giữ phòng đã hết hạn");
      return;
    }

    setSavingPay(true);
    try {
      const axiosResp = await startMomoPayment(String(bookingId));
      const payload = axiosResp;
      if (!payload?.payUrl) {
        message.error("Không nhận được payUrl từ MoMo");
        return;
      }
      window.location.href = String(payload.payUrl);
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể bắt đầu thanh toán MoMo"
      );
    } finally {
      setSavingPay(false);
    }
  };

  return (
    <div className="pay-page">
      <header className="pay-header">
        <div className="pay-header-inner">
          <div className="timer">
            <span>Hoàn tất thanh toán của bạn bằng </span>
            <span className="timer-pill">{fmtCountdown()}</span>
          </div>
        </div>
      </header>

      <main className="pay-main">
        <div className="pay-left">
          <h1 className="pay-title">Bạn muốn thanh toán thế nào?</h1>

          <div className="pay-panel">
            {loading ? (
              <div className="panel-loading">
                <Spin />
              </div>
            ) : (
              <>
                {booking?.status === "HOLD" && holdInfo ? (
                  <div className="hold-banner">
                    <span className="hold-label">Mã giữ</span>{" "}
                    {holdInfo.reservationCode}
                    <span className="hold-exp">
                      Hết hạn sau: <b>{fmtCountdown()}</b>
                    </span>
                  </div>
                ) : (
                  <div className="hold-banner muted">
                    Trạng thái: {booking?.status}
                  </div>
                )}

                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="method-group"
                >
                  <label
                    className={`method-item ${
                      paymentMethod === "MOMO" ? "selected" : ""
                    }`}
                  >
                    <Radio value="MOMO" />
                    <div className="method-body">
                      <div className="method-row">
                        <span className="method-title">MoMo</span>
                        <span className="badge badge-green">Online nhanh</span>
                      </div>
                      <ul className="method-desc">
                        <li>
                          Thanh toán dễ dàng bằng mã QR trên ứng dụng MoMo.
                        </li>
                        <li>
                          Sau khi bấm “Thanh toán & Hiển thị mã QR”, hệ thống sẽ
                          chuyển đến trang MoMo.
                        </li>
                        <li>
                          Trạng thái sẽ tự cập nhật khi MoMo gửi IPN về hệ
                          thống.
                        </li>
                      </ul>
                    </div>
                  </label>

                  <label
                    className={`method-item ${
                      paymentMethod === "PAY_AT_HOTEL" ? "selected" : ""
                    }`}
                  >
                    <Radio value="PAY_AT_HOTEL" />
                    <div className="method-body">
                      <div className="method-row">
                        <span className="method-title">
                          Thanh toán trực tiếp
                        </span>
                        <span className="badge badge-blue">Trả sau</span>
                      </div>
                      <ul className="method-desc">
                        <li>Thanh toán tại quầy khi nhận phòng.</li>
                        <li>Áp dụng theo chính sách của khách sạn.</li>
                      </ul>
                    </div>
                  </label>
                </Radio.Group>

                <div className="coupon-row">
                  <button className="plain-btn">+ Thêm mã giảm</button>
                </div>
              </>
            )}
          </div>

          <div className="pay-summary-total">
            <div className="total-line">
              <span>Tổng giá tiền</span>
              <span className="total-amount">
                {Number(booking?.amount ?? 0).toLocaleString("vi-VN")} VND
              </span>
            </div>
            <div className="cta-row">
              <Button
                className="cta-btn"
                type="primary"
                loading={savingPay}
                onClick={handleConfirm}
              >
                {paymentMethod === "MOMO"
                  ? "Thanh toán & Hiển thị mã QR"
                  : "Xác nhận phương thức"}
              </Button>
              <Button className="back-btn" onClick={handleBack}>
                Trở về
              </Button>
            </div>
            <div className="terms">
              Bằng cách tiếp tục thanh toán, bạn đã đồng ý Điều khoản & Chính
              sách quyền riêng tư.
            </div>
          </div>
        </div>

        <aside className="pay-right">
          <div className="hotel-card">
            <div className="hotel-card-header">
              <div className="booking-code">
                Mã đặt chỗ: <b>{booking?.id}</b>
              </div>
            </div>
            <div className="hotel-card-body">
              <div className="hotel-name">Mia Saigon Luxury Boutique Hotel</div>
              <div className="stay-dates">
                Nhận phòng: <b>{booking?.checkin_date}</b>
                <br />
                Trả phòng: <b>{booking?.checkout_date}</b>
                <br />
                {booking?.nights} đêm • {booking?.rooms} phòng •{" "}
                {booking?.adults} khách
              </div>
              <ul className="hotel-features">
                <li>WiFi miễn phí</li>
                <li>Bữa sáng cho 2 người</li>
                <li>Miễn phí hủy phòng (nếu có)</li>
              </ul>
              <div className="guest-info">
                <div className="guest-title">Tên khách</div>
                <div className="guest-value">
                  {booking?.guest_name || selection?.contactName}
                </div>
              </div>
              <div className="contact-info">
                <div className="guest-title">Chi tiết người liên lạc</div>
                <div className="guest-value">
                  {booking?.contact_name} • {booking?.contact_email} •{" "}
                  {booking?.contact_phone}
                </div>
              </div>
              {booking?.special_requests && (
                <div className="requests">
                  Yêu cầu đặc biệt:{" "}
                  {Array.isArray(booking?.special_requests)
                    ? booking.special_requests.join(", ")
                    : (() => {
                        try {
                          return JSON.parse(booking.special_requests).join(
                            ", "
                          );
                        } catch {
                          return "";
                        }
                      })()}
                </div>
              )}
            </div>
            <div className="hotel-card-footer">
              Sự lựa chọn tuyệt vời cho kỳ nghỉ của bạn!
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default BookingStep2;
