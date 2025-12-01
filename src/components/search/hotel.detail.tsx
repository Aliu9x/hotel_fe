import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import { Tag, Spin, Alert, Button, Collapse, Empty, message } from "antd";
import { ArrowLeftOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./hotel.detail.scss";
import type {
  HotelRoomTypeAvailability,
  HotelRoomTypesResponse,
  RatePlanPrice,
} from "@/types/global";
import { fetchHotelRoomTypes } from "@/services/api";

const { Panel } = Collapse;

const HotelDetail: React.FC = () => {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState<HotelRoomTypesResponse | undefined>();
  const [loading, setLoading] = useState(false);

  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = Number(searchParams.get("adults"));
  const children = Number(searchParams.get("children"));
  const rooms = Number(searchParams.get("rooms"));

  useEffect(() => {
    if (!hotelId || !checkin || !checkout || !adults || !rooms) return;
    setLoading(true);
    fetchHotelRoomTypes({
      hotelId: Number(hotelId),
      checkin: checkin!,
      checkout: checkout!,
      adults,
      children: isNaN(children) ? 0 : children,
      rooms,
    })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        message.error(err?.response?.data?.message || "Lỗi tải dữ liệu phòng");
      })
      .finally(() => setLoading(false));
  }, [hotelId, checkin, checkout, adults, children, rooms]);

 
  const RatePlanRow: React.FC<{
    rp: RatePlanPrice;
    rt: HotelRoomTypeAvailability;
  }> = ({ rp, rt }) => {
    return (
      <div className="rp-row">
        {/* LỰA CHỌN PHÒNG */}
        <div className="rp-cell rp-option">
          <div className="rp-line-header">
            {/* {rp.promo_tag && <Tag color="blue" className="rp-promo-tag">{rp.promo_tag}</Tag>} */}
            <span className="rp-room-rate-name">
              {rt.name} - {rp.name}
            </span>
          </div>
          <div className="rp-line-content">
            <div className="rp-rate-title">
              {/* {rp.breakfast_included ? 'Có bữa sáng' : 'Không gồm bữa sáng'} */}
            </div>
            <div className="rp-bed">🛏 2 giường đôi</div>
            <ul className="rp-policy-list">
              {rp.prepayment_required && (
                <li>
                  {rp.prepayment_required === true
                    ? "Thanh toán tại khách sạn"
                    : "Thanh toán trước"}
                  {/* {rp.cancellation_policy_short && (
                    <Tooltip title={rp.cancellation_policy_short}>
                      <InfoCircleOutlined className="rp-info-icon" />
                    </Tooltip>
                  )} */}
                </li>
              )}
              <li>
                {rp.refundable
                  ? "Áp dụng chính sách hủy phòng"
                  : "Không được hoàn tiền"}
                {!rp.refundable && (
                  <InfoCircleOutlined className="rp-info-icon" />
                )}
              </li>
            </ul>
          </div>
        </div>
        {/* KHÁCH */}
        <div className="rp-cell rp-guests">
          <div className="rp-guests-stack">
            <span className="rp-guest-icon">👤</span>
            <span className="rp-guest-count">{adults}</span>
            {children > 0 && (
              <span className="rp-guest-children">+{children} TE</span>
            )}
          </div>
        </div>
        {/* GIÁ / ĐÊM */}
        <div className="rp-cell rp-price">
          {/* {rp.promo_tag && <Tag color="geekblue" className="rp-promo-badge">{rp.promo_tag}</Tag>} */}
          {/* {rp.original_price && rp.original_price > rp.price_amount && (
            <div className="rp-original-price">
              {rp.original_price.toLocaleString('vi-VN')} VND
            </div>
          )} */}
          <div className="rp-current-price">
            {rp.price_amount.toLocaleString("vi-VN")} VND
          </div>
          <div className="rp-tax-note">Chưa bao gồm thuế và phí</div>
        </div>
        <div className="rp-cell rp-action">
          <Button
            type="primary"
            size="small"
            disabled={!rp.available_for_request}
            onClick={() => {
              const meta = data?.meta;
              if (!meta) {
                message.error("Thiếu meta");
                return;
              }
              const flow = {
                selection: {
                  hotelId: meta.hotel_id,
                  roomTypeId: rt.room_type_id,
                  ratePlanId: rp.rate_plan_id,
                  checkin: meta.checkin,
                  checkout: meta.checkout,
                  adults: meta.adults,
                  children: meta.children,
                  rooms: meta.requested_rooms,
                  price: rp.price_amount,
                  prepayRequired: !!rp.prepayment_required,
                },
                bookingId: null,
              };
              sessionStorage.setItem("bookingFlow", JSON.stringify(flow));
              navigate("/booking");
            }}
          >
            Chọn
          </Button>
          {/* {rp.remaining_rooms !== undefined && (
            <div className={`rp-remaining ${rp.remaining_rooms <= 2 ? 'hot' : ''}`}>
              {rp.remaining_rooms > 0 ? `Chỉ còn ${rp.remaining_rooms} phòng` : 'Hết phòng'}
            </div>
          )} */}
        </div>
      </div>
    );
  };

  return (
    <div className="hotel-detail-form-page">
      <div className="detail-topbar">
        <div className="detail-topbar-inner">
          <Button
            icon={<ArrowLeftOutlined />}
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          {data && (
            <div className="topbar-tags">
              <Tag color="blue">
                {data.meta.checkin} → {data.meta.checkout} ({data.meta.nights}{" "}
                đêm)
              </Tag>
              <Tag color="geekblue">{data.meta.requested_rooms} phòng</Tag>
              <Tag color="green">NL: {data.meta.adults}</Tag>
              <Tag color="orange">TE: {data.meta.children}</Tag>
              <Tag color="purple">Tổng: {data.meta.total_guests}</Tag>
            </div>
          )}
        </div>
      </div>

      <div className="hotel-detail-form-container">
        {loading && (
          <div className="loading-wrap">
            <Spin size="large" />
          </div>
        )}

        {!loading && data && data.room_types.length === 0 && (
          <Alert type="info" showIcon message="Chưa có loại phòng." />
        )}

        {!loading &&
          data &&
          data.room_types.map((rt) => {
            const hasPlans = rt.rate_plans && rt.rate_plans.length > 0;
            return (
              <div key={rt.room_type_id} className="room-card">
                <div className="room-left">
                  <h2 className="room-title">{rt.name}</h2>
                  <div className="room-image-wrapper">
                    <div className="room-image">
                      <img
                        src="https://via.placeholder.com/560x360?text=Room+Image"
                        alt={rt.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="room-image-dots">
                      <span className="dot active" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </div>

                  <div className="room-typical">
                    <span className="room-typical-icon">✨</span>
                    Phòng này thường lưu trú{" "}
                    {Math.min(rt.capacity.max_occupancy, 4)} khách
                  </div>

                  <ul className="room-attributes">
                    <li>
                      <span className="attr-icon">📐</span>
                      <span>35.0 m²</span>
                    </li>
                    <li>
                      <span className="attr-icon">🚿</span>
                      <span>Vòi tắm đứng</span>
                    </li>
                    <li>
                      <span className="attr-icon">🧊</span>
                      <span>Tủ lạnh</span>
                    </li>
                    <li>
                      <span className="attr-icon">🔥</span>
                      <span>Nước nóng</span>
                    </li>
                    <li>
                      <span className="attr-icon">❄️</span>
                      <span>Máy lạnh</span>
                    </li>
                  </ul>

                  <div className="room-link-detail">
                    <Button type="link" size="small">
                      Xem chi tiết phòng
                    </Button>
                  </div>

                  <Collapse ghost className="room-collapse">
                    <Panel header="Chi tiết tồn kho theo ngày" key="daily">
                      {rt.daily.length === 0 && (
                        <Empty
                          description="Không có dữ liệu"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      )}
                      {rt.daily.length > 0 && (
                        <div className="daily-grid">
                          {rt.daily.map((d) => (
                            <div
                              key={d.date}
                              className={`daily-item ${
                                d.stop_sell === 1 ? "stop" : ""
                              }`}
                            >
                              <span className="di-date">
                                {dayjs(d.date).format("DD/MM")}
                              </span>
                              <span className="di-avail">
                                {d.effective_available}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Panel>
                  </Collapse>
                </div>

                {/* RIGHT COLUMN (RATE PLANS TABLE STYLE) */}
                <div className="room-right">
                  <div className="rp-table-header">
                    <div className="col-option">Lựa chọn phòng</div>
                    <div className="col-guests">Khách</div>
                    <div className="col-price">Giá/phòng/đêm</div>
                    <div className="col-action">Đặt</div>
                  </div>

                  {hasPlans ? (
                    <div className="rp-table-body">
                      {rt.rate_plans.map((rp) => (
                        <RatePlanRow key={rp.rate_plan_id} rp={rp} rt={rt} />
                      ))}
                    </div>
                  ) : (
                    <div className="rp-table-empty">
                      <Empty
                        description="Chưa có gói giá"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default HotelDetail;
