import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Radio, Spin, App } from "antd";
import dayjs from "dayjs";
import {
  cancelHold,
  getBooking,
  reserveBooking,
  startMomoPayment,
  updatePaymentMethod,
} from "@/services/api";
import "./bookingStep2.css";
import { PaymentSuccessModal } from "./success.modal";

type PaymentMethod = "PREPAID" | "PAY_AT_HOTEL";

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
  const location = useLocation();
  const dataBooking: any = location.state.dataBooking;
  const nameHotel: any = location.state.n;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { bookingId, selection } = readFlow();
  const redirectedOnce = useRef(false);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [holdInfo, setHoldInfo] = useState<any>(null);
  const [countdownText, setCountdownText] = useState("00:00");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PREPAID");
  const [savingPay, setSavingPay] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
      } catch (e: any) {
        message.error(e?.response?.data?.message || "Không thể giữ phòng");
      } finally {
        setLoading(false);
      }
    };
    doReserve();
  }, [booking]);

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
          setShowSuccess(true);
          navigate("/", { replace: true });
        }
      } catch {}
    }
    timer = setInterval(pollStatus, 3000);
    return () => clearInterval(timer);
  }, [bookingId, navigate]);

  const handleBack = async () => {
    if (booking?.status === "HOLD") {
      try {
        await cancelHold(booking.id);
      } catch {}
    }
    navigate("/booking");
  };

  const handleConfirm = async () => {
    setSavingPay(true);
    try {
      if (paymentMethod === "PAY_AT_HOTEL") {
        const res = await updatePaymentMethod(String(bookingId), paymentMethod);
        if (res) {
          setShowSuccess(true);
          setTimeout(() => {
            sessionStorage.removeItem("bookingFlow");
          }, 10000);
          navigate("/retrieve");
          return;
        }
      }
      if (paymentMethod === "PREPAID") {
        const axiosResp = await startMomoPayment(String(bookingId));
        const payload = axiosResp;

        if (!payload?.payUrl) {
          message.error("Không nhận được payUrl từ MoMo");
          return;
        }
        window.location.href = String(payload.payUrl);
      }
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể bắt đầu thanh toán"
      );
    } finally {
      setSavingPay(false);
    }
  };

  useEffect(() => {
    if (!dataBooking?.payment_expired_at) return;
    let timer: any;
    const tick = () => {
      const now = Date.now();
      const expiredAt = new Date(dataBooking.payment_expired_at).getTime();
      const remain = expiredAt - now;
      if (remain <= 0) {
        setCountdownText("00:00");
        try {
          sessionStorage.removeItem("bookingFlow");
        } catch {}
        message.error("Đã hết thời gian thanh toán");
        navigate(-1);

        return;
      }
      const totalSeconds = Math.floor(remain / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setCountdownText(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`
      );
      const delay = 1000 - (now % 1000);
      timer = setTimeout(tick, delay);
    };

    tick();

    return () => clearTimeout(timer);
  }, [dataBooking?.payment_expired_at, navigate]);

  return (
    <>
      {!bookingId ? null : (
        <div className="pay-page">
          <header className="pay-header">
            <div className="pay-header-inner">
              <div className="timer">
                <span>Hoàn tất thanh toán của bạn bằng </span>
                <span className="timer-pill">{countdownText}</span>
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
                          <span className="timer-pill">{countdownText}</span>
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
                          paymentMethod === "PREPAID" ? "selected" : ""
                        }`}
                      >
                        <Radio value="PREPAID" />
                        <div className="method-body">
                          <div className="method-row">
                            <span className="method-title">MoMo</span>
                            <span className="badge badge-green">
                              Online nhanh
                            </span>
                          </div>
                          <ul className="method-desc">
                            <li>
                              Thanh toán dễ dàng bằng mã QR trên ứng dụng MoMo.
                            </li>
                            <li>
                              Sau khi bấm “Thanh toán & Hiển thị mã QR”, hệ
                              thống sẽ chuyển đến trang MoMo.
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
                    {paymentMethod === "PREPAID"
                      ? "Thanh toán & Hiển thị mã QR"
                      : "Xác nhận phương thức"}
                  </Button>
                  <Button className="back-btn" onClick={handleBack}>
                    Trở về
                  </Button>
                </div>
                <div className="terms">
                  Bằng cách tiếp tục thanh toán, bạn đã đồng ý Điều khoản &
                  Chính sách quyền riêng tư.
                </div>
              </div>
            </div>

            <aside className="pay-right">
              <div className="hotel-card">
                <div className="hotel-card-header">
                  <div className="booking-code">
                    Mã đặt chỗ: <b>{dataBooking?.reservation_code}</b>
                  </div>
                </div>
                <div className="hotel-card-body">
                  <div className="hotel-name">{nameHotel.hotel_name}</div>
                  <div className="stay-dates">
                    Nhận phòng: <b>{dataBooking?.checkin_date}</b>
                    <br />
                    Trả phòng: <b>{dataBooking?.checkout_date}</b>
                    <br />
                    {dataBooking?.nights} đêm • {dataBooking?.rooms} phòng •{" "}
                    {dataBooking?.adults} khách
                  </div>
                  <div className="guest-info">
                    <div className="guest-title">Tên khách</div>
                    <div className="guest-value">
                      {dataBooking?.guest_name || selection?.contactName}
                    </div>
                  </div>
                  <div className="contact-info">
                    <div className="guest-title">Chi tiết người liên lạc</div>
                    <div className="guest-value">
                      {dataBooking?.contact_name} • {dataBooking?.contact_email}{" "}
                      • {dataBooking?.contact_phone}
                    </div>
                  </div>
                  {dataBooking?.special_requests && (
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
      )}
      <PaymentSuccessModal
        open={showSuccess}
        onDone={() => navigate("/", { replace: true })}
      />
    </>
  );
};

export default BookingStep2;
