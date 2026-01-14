import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import {
  Tag,
  Spin,
  Alert,
  Button,
  Empty,
  message,
  Rate,
  Tooltip,
  Carousel,
  Modal,
} from "antd";
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  CoffeeOutlined,
  LaptopOutlined,
  SkinOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  StopOutlined,
  SafetyOutlined,
  FileTextOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "./hotel.detail.scss";
import HotelImageGallery from "./hotel.lmage.gallery";
import type {
  HotelAvailability,
  RatePlanPrice,
  RoomTypeAvailability,
} from "@/types/global";
import {
  holdBooking,
  loadImageRoomType,
  searchAvailability,
} from "@/services/api";
import { useCurrentApp } from "@/components/context/app.context";

const formatVND = (v: number) => v.toLocaleString("vi-VN") + " VND";

type RoomTypeImages = {
  thumbnail?: string;
  slider?: string[];
  allImages: string[];
};

const placeholderImg = "https://via.placeholder.com/560x360?text=Room+Image";

// Slider chỉ hiển thị 1 ảnh, lướt trái/phải để xem ảnh khác
const RoomImageSlider: React.FC<{ images: string[]; altName: string }> = ({
  images,
  altName,
}) => {
  const carouselRef = useRef<any>(null);
  const slides = images?.length ? images : [placeholderImg];

  return (
    <div className="room-image-slider">
      <Carousel
        ref={carouselRef}
        dots
        swipeToSlide
        draggable
        lazyLoad="progressive"
      >
        {slides.map((src, idx) => (
          <div key={idx} className="room-image-slide">
            <img src={src} alt={`${altName} ${idx + 1}`} loading="lazy" />
          </div>
        ))}
      </Carousel>

      {slides.length > 1 && (
        <>
          <button
            className="nav-btn prev"
            aria-label="Ảnh trước"
            onClick={() => carouselRef.current?.prev()}
          >
            <LeftOutlined />
          </button>
          <button
            className="nav-btn next"
            aria-label="Ảnh sau"
            onClick={() => carouselRef.current?.next()}
          >
            <RightOutlined />
          </button>
        </>
      )}
    </div>
  );
};

const HotelDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hotelId } = useParams(); // Lấy id khách sạn từ URL\
  // State mới để render (ban đầu là từ state nếu có)
  const hotelFromState: HotelAvailability | undefined = location.state?.hotel;
  const metaFromState: any = location.state?.meta;
  console.log(hotelFromState, metaFromState);
  // State mới để render (ban đầu là từ state nếu có)
  const [hotel, setHotel] = useState<HotelAvailability | undefined>(
    hotelFromState
  );
  const [meta, setMeta] = useState<any>(metaFromState);
  const [loadingData, setLoadingData] = useState(false);
  const [menity, setAmenity] = useState<any[]>([]);
  const [roomImages, setRoomImages] = useState<Record<string, RoomTypeImages>>(
    {}
  );
  useEffect(() => {
    // Nếu đã có đủ data hotel+meta => render luôn
    if (hotelFromState && metaFromState) {
      setHotel(hotelFromState);
      setMeta(metaFromState);
      return;
    }
    // Nếu thiếu data, gọi lại API search để lấy đúng khách sạn này về
    if (!hotelId) return;

    // Lấy lại filter meta params cuối cùng từ sessionStorage
    // NÊN lưu ở SearchResults mỗi khi search/filter thành công
    const lastSearchParams = sessionStorage.getItem("lastSearchParams");
    if (!lastSearchParams) {
      // Không có filter, không biết search theo gì, chuyển user về trang tìm kiếm
      navigate("/search-results");
      return;
    }
    const parsedParams = JSON.parse(lastSearchParams);
    // Gọi lại searchAvailability với filter+hotelId vừa lấy được
    setLoadingData(true); // Show loading khi fetch lại
    searchAvailability({ ...parsedParams, hotelId: Number(hotelId) })
      .then((res) => {
        const found = res.data.hotels?.find(
          (h) => h.hotel_id === Number(hotelId)
        );
        if (found) {
          setHotel(found);
          setMeta(res.data.meta);
        } else {
          // Không tìm thấy khách sạn, quay về search
          message.error("Không tìm thấy dữ liệu khách sạn này.");
          navigate("/search-results");
        }
      })
      .catch(() => {
        message.error("Không thể nạp lại dữ liệu khách sạn.");
        navigate("/search-results");
      })
      .finally(() => setLoadingData(false));
  }, [hotelFromState, metaFromState, hotelId, navigate]);
  useEffect(() => {
    setAmenity(hotel?.amenity || []);

    const rts: RoomTypeAvailability[] = Array.isArray(hotel?.matched_room_types)
      ? (hotel!.matched_room_types as RoomTypeAvailability[])
      : [];
    if (rts.length === 0) return;

    const resolveUrl = (name?: string) => {
      if (!name) return "";
      if (/^https?:\/\//i.test(name)) return name;
      const base = import.meta.env.VITE_BACKEND_URL;
      return `${base}/images/roomType/${encodeURIComponent(name)}`;
    };

    const fetchAllRoomTypeImages = async () => {
      const entries = await Promise.all(
        rts.map(async (rt) => {
          const key = String(rt.room_type_id);
          try {
            const resImage = await loadImageRoomType(key);
            const data = (resImage?.data ?? {}) as {
              thumbnail?: string;
              slider?: string[];
            };

            const allImagesRaw = [
              data?.thumbnail,
              ...(Array.isArray(data?.slider) ? data.slider : []),
            ].filter(
              (s): s is string => typeof s === "string" && s.trim().length > 0
            );

            const allImages = allImagesRaw.map(resolveUrl);
            const value: RoomTypeImages = {
              thumbnail: data?.thumbnail,
              slider: Array.isArray(data?.slider) ? data.slider : [],
              allImages,
            };
            return [key, value] as const;
          } catch {
            return [
              key,
              { thumbnail: undefined, slider: [], allImages: [] },
            ] as const;
          }
        })
      );

      setRoomImages(Object.fromEntries(entries));
    };

    // fetchAllRoomTypeImages();
  }, [hotel]);

  const loading = false;
  const minPrice =
    typeof hotel?.hotel_min_price === "number"
      ? hotel.hotel_min_price
      : undefined;

  const RatePlanRow: React.FC<{
    rp: RatePlanPrice;
    rt: RoomTypeAvailability;
  }> = ({ rp, rt }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const disableChoose = rt.total_rooms < meta?.requested_rooms;
    const { isAuthenticated } = useCurrentApp();
    const handleChooseRoom = async () => {
      if (!isAuthenticated) {
        setModalOpen(true);
        return;
      }
      if (!hotel) {
        message.error("Thiếu dữ liệu khách sạn");
        return;
      }
      try {
        // 1. Gọi lại API search phòng với params hiện tại và hotelId
        const params = {
          checkin: meta.checkin,
          checkout: meta.checkout,
          adults: meta.adults,
          children: meta.children,
          rooms: meta.requested_rooms,
          hotelId: hotel.hotel_id,
        };
        const res = await searchAvailability(params);
        const hotels = res.data?.hotels || [];

        // 2. Tìm lại đúng hotel, roomType và ratePlan
        const matchedHotel = hotels.find((h) => h.hotel_id === hotel.hotel_id);
        if (!matchedHotel) {
          message.error("Khách sạn này không còn phòng phù hợp.");
          return;
        }
        // Tìm lại room type
        const matchedRoomType = matchedHotel.matched_room_types.find(
          (r) => r.room_type_id === rt.room_type_id
        );
        if (!matchedRoomType) {
          message.error("Loại phòng này hiện không còn phù hợp.");
          return;
        }
        // Tìm lại rate plan
        const matchedRatePlan = matchedRoomType.rate_plans.find(
          (r) => r.rate_plan_id === rp.rate_plan_id
        );
        if (!matchedRatePlan) {
          message.error("Gói giá vừa chọn đã hết, vui lòng chọn lại.");
          return;
        }
        // Đủ điều kiện, lưu flow và next

        const booking = await holdBooking({
          hotelId: hotel.hotel_id,
          roomTypeId: rt.room_type_id,
          checkin: meta.checkin,
          ratePlanId: rp.rate_plan_id,
          checkout: meta.checkout,
          adults: meta.adults,
          children: meta.children,
          rooms: meta.requested_rooms,
        });

        const flow = {
          selection: {
            hotelId: hotel.hotel_id,
            roomTypeId: rt.room_type_id,
            ratePlanId: rp.rate_plan_id,
            checkin: meta.checkin,
            checkout: meta.checkout,
            adults: meta.adults,
            children: meta.children,
            rooms: meta.requested_rooms,
            price: matchedRatePlan.stay_total,
            prepayRequired: !!matchedRatePlan.prepayment_required,
          },
          bookingId: booking.data?.id,
        };

        sessionStorage.setItem("bookingFlow", JSON.stringify(flow));
        navigate("/booking", {
          state: {
            h: matchedHotel,
            m: meta,
            nrt: matchedRoomType.name,
            nrp: matchedRatePlan.name,
          },
        });
      } catch (err) {
        console.error(err);
        message.error("Không kiểm tra được phòng. Vui lòng thử lại.");
      }
    };
    const tooltipContent = (
      <div className="pt-wrap">
        <div className="pt-title">
          Giá cho {meta.requested_rooms} phòng {meta.nights} đêm
        </div>
        <div className="pt-row">
          <span>Giá mỗi đêm</span>
          <span>{formatVND(rp.nightly_total)}</span>
        </div>
        <div className="pt-sep" />
        <div className="pt-row">
          <span>Giá phòng</span>
          <span>{formatVND(rp.nightly_total * Math.max(meta?.nights, 1))}</span>
        </div>
        <div className="pt-sep" />
        <div className="pt-row pt-total">
          <span>Tổng giá tiền</span>
          <span>{formatVND(rp.stay_total)}</span>
        </div>
      </div>
    );
    return (
      <>
        {" "}
        <div className="rp-row">
          <div className="rp-cell rp-option">
            <div className="rp-line-header">
              <Tooltip title={rp.description} placement="top">
                <span className="rp-room-rate-name"> {rp.name}</span>
              </Tooltip>
            </div>
            <div className="rp-line-content">
              <div className="rp-bed">🛏 {rt.bed_config || "—"}</div>
              <ul className="rp-policy-list">
                <li>
                  {rp.prepayment_required
                    ? "Thanh toán trước"
                    : "Thanh toán tại khách sạn"}
                  <InfoCircleOutlined className="rp-info-icon" />
                </li>
              </ul>
            </div>
          </div>

          <div className="rp-cell rp-rooms">
            <div className="rp-guests-stack">
              <span className="rp-guest-icon">👤</span>
              <span className="rp-guest-count">{meta?.adults}</span>
              {meta?.children > 0 && (
                <span className="rp-guest-count">+{meta?.children} TE</span>
              )}
            </div>
          </div>

          <div className="rp-cell rp-rooms">
            <div className="rp-rooms-count">{meta?.requested_rooms} phòng</div>
            <div
              className={
                "rp-remaining" +
                (rt.total_rooms - meta?.requested_rooms <= 2 ? " hot" : "")
              }
            ></div>
          </div>

          <div className="rp-cell rp-price">
            <Tooltip
              overlayClassName="price-tooltip"
              placement="bottom"
              title={tooltipContent}
            >
              <div className="rp-current-price" role="button">
                {rp.nightly_total.toLocaleString("vi-VN")} VND
              </div>
            </Tooltip>
            <div className="rp-tax-note">Chưa bao gồm thuế và phí</div>
          </div>

          <div className="rp-cell rp-action">
            <Button
              type="primary"
              size="small"
              className="rp-choose-btn"
              disabled={disableChoose}
              onClick={handleChooseRoom}
            >
              Chọn
            </Button>
            {disableChoose && (
              <div className="rp-remaining hot">Không đủ phòng cho yêu cầu</div>
            )}
          </div>
        </div>
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          centered
        >
          <div style={{ textAlign: "center", padding: 16 }}>
            <h3>Bạn cần đăng nhập để đặt phòng</h3>
            <p>
              Vui lòng đăng nhập để tiếp tục đặt phòng với lựa chọn của bạn.
            </p>
            <Button
              type="primary"
              onClick={() => {
                navigate("/login", {
                  state: {
                    redirectPath: location.pathname + location.search,
                  },
                });
              }}
              style={{ width: "100%", marginTop: 16 }}
            >
              Đăng nhập ngay
            </Button>
          </div>
        </Modal>
      </>
    );
  };

  const categoryIcon = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("ẩm thực") || n.includes("mini")) return <CoffeeOutlined />;
    if (n.includes("làm việc") || n.includes("workspace"))
      return <LaptopOutlined />;
    if (n.includes("phong cảnh") || n.includes("không gian"))
      return <PictureOutlined />;
    if (n.includes("cá nhân") || n.includes("chăm sóc"))
      return <SkinOutlined />;
    return <AppstoreOutlined />;
  };

  const dedupeAmenities = (arr: any[]) => {
    const seen = new Set<string>();
    return (Array.isArray(arr) ? arr : []).filter((a) => {
      const key = `${a?.amenity_id || ""}|${(a?.name || "").trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const AmenityCategoryCard: React.FC<{ cat: any }> = ({ cat }) => {
    const list = dedupeAmenities(cat?.amenities);
    if (!list.length) return null;
    return (
      <div className="amenity-card">
        <div className="amenity-card__header">
          <span className="amenity-card__icon">
            {categoryIcon(cat?.category_name)}
          </span>
          <h3 className="amenity-card__title">{cat?.category_name}</h3>
        </div>
        <ul className="amenity-card__list">
          {list.map((a: any) => (
            <li key={`${a?.mapping_id || a?.amenity_id || a?.name}`}>
              <CheckCircleOutlined className="amenity-check" />
              <span className="amenity-name">{a?.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const amenityCategories: any[] = Array.isArray(menity) ? menity : [];

  const policiesRaw: any[] = Array.isArray((hotel as any)?.hotelPolicies)
    ? (hotel as any).hotelPolicies
    : (hotel as any)?.hotelPolicies
    ? [(hotel as any).hotelPolicies]
    : [];

  const formatTime = (t?: string) => (t ? t.slice(0, 5) : "—");
  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "—";

  const PolicyCard: React.FC<{ p: any }> = ({ p }) => {
    if (!p) return null;
    return (
      <div className="policy-card">
        <div className="policy-card__grid">
          <div className="policy-item">
            <div className="policy-item__label">
              <ClockCircleOutlined /> Giờ nhận/trả phòng
            </div>
            <div className="policy-item__value">
              Nhận: <strong>{formatTime(p?.default_checkin_time)}</strong> ·
              Trả: <strong>{formatTime(p?.default_checkout_time)}</strong>
            </div>
          </div>

          <div className="policy-item">
            <div className="policy-item__label">
              <TeamOutlined /> Chính sách trẻ em
            </div>
            <div className="policy-item__value">
              {p?.children_policy || "—"}
            </div>
          </div>

          <div className="policy-item">
            <div className="policy-item__label">
              <StopOutlined /> Hút thuốc
            </div>
            <div className="policy-item__value">{p?.smoking_policy || "—"}</div>
          </div>

          <div className="policy-item">
            <div className="policy-item__label">
              <SafetyOutlined /> Vật nuôi
            </div>
            <div className="policy-item__value">{p?.pets_policy || "—"}</div>
          </div>

          <div className="policy-item policy-item--wide">
            <div className="policy-item__label">
              <FileTextOutlined /> Nội quy
            </div>
            <div className="policy-item__value">{p?.house_rules || "—"}</div>
          </div>

          <div className="policy-item policy-item--wide">
            <div className="policy-item__label">
              <FileTextOutlined /> Chính sách khác
            </div>
            <div className="policy-item__value">{p?.other_policies || "—"}</div>
          </div>
        </div>

        <div className="policy-card__footer">
          <span>Tạo lúc: {formatDate(p?.created_at)}</span>
          <span>Cập nhật: {formatDate(p?.updated_at)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="hotel-detail-form-page">
      <div className="hotel-detail-form-container">
        {loading && (
          <div className="loading-wrap">
            <Spin size="large" />
          </div>
        )}

        {hotel?.images && hotel.images.length > 0 && (
          <HotelImageGallery hotelImage={hotel.images} />
        )}

        {hotel && (
          <div className="hotel-head-card">
            <div className="head-left">
              <h1 className="hotel-name">
                {hotel.hotel_name}
                <Tag color="geekblue" className="hotel-kind-badge">
                  Khách Sạn
                </Tag>
              </h1>
              <div className="hotel-stars">
                <Rate
                  disabled
                  allowHalf={false}
                  value={hotel.star_rating || 0}
                />
                {hotel.star_rating ? (
                  <span className="hotel-stars-text">
                    {hotel.star_rating} sao
                  </span>
                ) : null}
              </div>
              <div className="hotel-address">
                <EnvironmentOutlined className="addr-icon" />
                <span className="addr-text">
                  {hotel.address_line || "—"},{hotel.ward || "—"},
                  {hotel.district || "—"},{hotel.province || "—"}
                </span>
              </div>
            </div>
            <div className="head-right">
              <div className="price-label">Giá/phòng/đêm từ</div>
              <div className="min-price">
                {typeof minPrice === "number"
                  ? `${minPrice.toLocaleString("vi-VN")} VND`
                  : "—"}
              </div>
              <Button
                className="choose-room-top"
                type="primary"
                onClick={() => {
                  const el = document.getElementById("rooms");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Chọn phòng
              </Button>
            </div>
          </div>
        )}

        <div id="rooms"></div>

        {!loading && hotel && hotel.matched_room_types.length === 0 && (
          <Alert type="info" showIcon message="Chưa có loại phòng." />
        )}

        {!loading &&
          hotel &&
          hotel.matched_room_types.map((rt) => {
            const key = String(rt.room_type_id);
            const rtImgs = roomImages[key]?.allImages || [];

            return (
              <div key={key} className="room-card">
                <div className="room-left">
                  <h2 className="room-title">{rt.name}</h2>

                  {/* KHUNG ảnh: chỉ 1 ảnh, trượt trái/phải để xem ảnh khác */}
                  <RoomImageSlider images={rtImgs} altName={rt.name} />

                  <div className="room-typical">
                    <span className="room-typical-icon">✨</span>
                    Phòng này thường lưu trú {Math.min(
                      rt.max_occupancy,
                      4
                    )}{" "}
                    khách
                  </div>

                  <ul className="room-attributes">
                    <li>
                      <span className="attr-icon">🚭</span>
                      <span>
                        {rt.smoking_allowed
                          ? "Cho hút thuốc"
                          : "Không hút thuốc"}
                      </span>
                    </li>
                    <li>
                      <span className="attr-icon">👀</span>
                      <span>{rt.view || "—"}</span>
                    </li>
                  </ul>

                  <div className="room-link-detail">
                    <Button type="link" size="small">
                      Xem chi tiết phòng
                    </Button>
                  </div>
                </div>

                <div className="room-right">
                  <div className="rp-table-header">
                    <div className="col-option">Lựa chọn phòng</div>
                    <div className="col-guests">Khách</div>
                    <div className="col-rooms">Phòng</div>
                    <div className="col-price">Giá/phòng/đêm</div>
                    <div className="col-action">Đặt</div>
                  </div>

                  {rt.rate_plans && rt.rate_plans.length > 0 ? (
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

        {amenityCategories.length > 0 && (
          <div id="amenities" className="amenities-section">
            <div className="amenities-head">
              <h2 className="amenities-title">Tiện ích tại cơ sở</h2>
              <div className="amenities-sub">Các danh mục tiện ích nổi bật</div>
            </div>

            <div className="amenities-grid">
              {amenityCategories.map((cat) => (
                <AmenityCategoryCard
                  key={cat?.category_id || cat?.category_name}
                  cat={cat}
                />
              ))}
            </div>
          </div>
        )}

        {policiesRaw.length > 0 && (
          <div id="policies" className="policies-section">
            <div className="policies-head">
              <h2 className="policies-title">Chính sách lưu trú</h2>
              <div className="policies-sub">
                Những quy định cần biết khi đặt và lưu trú
              </div>
            </div>

            {policiesRaw.map((p, idx) => (
              <PolicyCard key={p?.id || idx} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelDetail;
