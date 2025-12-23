import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Slider,
  Button,
  Tag,
  Space,
  message,
  Spin,
  Checkbox,
  Radio,
  Divider,
  Skeleton,
} from "antd";
import "./search-results.scss";

import SearchResultsTopBar from "./search.results.top.bar";
import type { AvailabilityResponse, IAvailabilityParams } from "@/types/global";
import {
  buildAvailabilityQuery,
  parseAvailabilityParamsFromURL,
} from "@/services/helper";
import { searchAvailability, getAmenitySearch } from "@/services/api";

type SortOption = "price_asc" | "price_desc";

const flexibleOptions = [
  { label: "Miễn phí hủy phòng", value: "free_cancellation" },
  { label: "Thanh toán tại khách sạn", value: "pay_at_hotel" },
];
const IMG_PREFIX = import.meta.env.VITE_BACKEND_URL as string;
const buildUrl = (f?: string) => (f ? `${IMG_PREFIX}/images/hotel/${f}` : undefined);

const DEFAULT_PRICE_RANGE: [number, number] = [0, 20000000]; // FE range, map sang minPrice/maxPrice
const DEFAULT_STAR_RANGE: [number, number] = [0, 5];
const DEFAULT_SORT: SortOption = "price_desc"; // mặc định giá giảm dần

const SHOW_COUNT = 5;

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navState = location.state as {
    availability?: AvailabilityResponse;
  } | null;

  const [availability, setAvailability] = useState<
    AvailabilityResponse | undefined
  >(navState?.availability);
  const [loading, setLoading] = useState(false);

  // Range filters (FE state)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || DEFAULT_PRICE_RANGE[0],
    Number(searchParams.get("maxPrice")) || DEFAULT_PRICE_RANGE[1],
  ]);
  const [starRange, setStarRange] = useState<[number, number]>([
    Number(searchParams.get("minStar")) || DEFAULT_STAR_RANGE[0],
    Number(searchParams.get("maxStar")) || DEFAULT_STAR_RANGE[1],
  ]);

  // Checkbox filters
  const initialRoomAmenityIds = (searchParams.getAll("roomAmenityIds") || [])
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
  const [roomAmenityIds, setRoomAmenityIds] = useState<number[]>(
    initialRoomAmenityIds
  );

  // Hotel amenities: convert sang number[]
  const initialHotelAmenityIds = (searchParams.getAll("hotelAmenityIds") || [])
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
  const [hotelAmenityIds, setHotelAmenityIds] = useState<number[]>(
    initialHotelAmenityIds
  );

  // Flexible: map sang booleans
  const [flexible, setFlexible] = useState<string[]>(
    searchParams.getAll("flexible") || []
  );

  // Sort FE radio -> BE sortPrice
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || DEFAULT_SORT
  );

  const sortLabel = useMemo(
    () => (sort === "price_asc" ? "Giá thấp nhất" : "Giá cao nhất"),
    [sort]
  );

  // ====== Load Amenities theo applies_to ======
  const [roomAmenitiesOptions, setRoomAmenitiesOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [hotelAmenitiesOptions, setHotelAmenitiesOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [amenityLoading, setAmenityLoading] = useState(false);

  // ... các import và state giữ nguyên

  useEffect(() => {
    let mounted = true;
    setAmenityLoading(true);

    const loadAmenities = async () => {
      try {
        // Gọi song song 2 API
        const [roomRes, hotelRes] = await Promise.all([
          getAmenitySearch("Room"), // roomtype
          getAmenitySearch("Hotel"),
        ]);

        // Tùy thuộc vào axios wrapper, có thể là roomRes.data hoặc roomRes.data.data
        const roomData = roomRes?.data ?? roomRes?.data ?? [];
        const hotelData = hotelRes?.data ?? hotelRes?.data ?? [];

        // Map đúng dạng phẳng: [{id, name}]
        const roomList: { label: string; value: string }[] = roomData.map(
          (a: any) => ({
            label: a.name,
            value: String(a.id),
          })
        );

        const hotelList: { label: string; value: string }[] = hotelData.map(
          (a: any) => ({
            label: a.name,
            value: String(a.id),
          })
        );

        if (!mounted) return;
        setRoomAmenitiesOptions(roomList);
        setHotelAmenitiesOptions(hotelList);
      } catch (err: any) {
        console.error(err);
        message.error(err?.response?.data?.message || "Lỗi tải tiện ích");
      } finally {
        if (mounted) setAmenityLoading(false);
      }
    };

    loadAmenities();
    return () => {
      mounted = false;
    };
  }, []);
  // ====== Tải AVAILABILITY ban đầu từ URL ======
  useEffect(() => {
    if (!availability) {
      const parsed = parseAvailabilityParamsFromURL(location.search);
      if (
        !parsed.checkin ||
        !parsed.checkout ||
        !parsed.adults ||
        !parsed.rooms
      )
        return;
      setLoading(true);
      searchAvailability(parsed as IAvailabilityParams)
        .then((res) => setAvailability(res.data))
        .catch((err) => {
          console.error(err);
          message.error(err?.response?.data?.message || "Lỗi tải kết quả");
        })
        .finally(() => setLoading(false));
    }
  }, [availability, location.search]);

  // Build params đúng DTO BE
  const buildParamsFromState = (): IAvailabilityParams | undefined => {
    if (!availability) return undefined;
    const meta = availability.meta;

    const refundableOnly = flexible.includes("free_cancellation") || undefined;
    const payAtHotelOnly = flexible.includes("pay_at_hotel") || undefined;

    // Map sort  -> BE sortPrice
    const sortPrice: "asc" | "desc" = sort === "price_asc" ? "asc" : "desc";

    // Parse mảng id string -> number[]
    const toNumArray = (vals: (string | number)[]): number[] | undefined => {
      const arr = vals.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
      return arr.length ? arr : undefined;
    };

    const params: IAvailabilityParams = {
      checkin: meta.checkin,
      checkout: meta.checkout,
      adults: meta.adults,
      children: meta.children,
      rooms: meta.requested_rooms,

      // vị trí
      hotelId: searchParams.get("hotelId")
        ? Number(searchParams.get("hotelId"))
        : undefined,
      provinceId: searchParams.get("provinceId")
        ? Number(searchParams.get("provinceId"))
        : undefined,
      districtId: searchParams.get("districtId")
        ? Number(searchParams.get("districtId"))
        : undefined,
      wardId: searchParams.get("wardId")
        ? Number(searchParams.get("wardId"))
        : undefined,

      // amenities
      roomAmenityIds: toNumArray(roomAmenityIds),
      hotelAmenityIds: toNumArray(hotelAmenityIds),

      // ranges
      minStar: starRange[0] || undefined,
      maxStar: starRange[1] || undefined,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] || undefined,

      // flexible
      refundableOnly,
      payAtHotelOnly,

      // sort
      sortPrice,
    };

    return params;
  };

  const applyFilters = useCallback(async () => {
    const params = buildParamsFromState();
    if (!params) return;
    setLoading(true);
    try {
      const res = await searchAvailability(params);
      setAvailability(res.data);
      const qs = buildAvailabilityQuery(params);
      window.history.replaceState({}, "", `/search-results?${qs}`);
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || "Áp dụng lọc thất bại");
    } finally {
      setLoading(false);
    }
  }, [
    availability,
    priceRange,
    starRange,
    roomAmenityIds,
    hotelAmenityIds,
    flexible,
    sort,
    searchParams,
  ]);

  useEffect(() => {
    if (!availability) return;
    applyFilters();
  }, [priceRange, starRange, roomAmenityIds, hotelAmenityIds, flexible, sort]);

  const resetAllFilters = () => {
    setPriceRange(DEFAULT_PRICE_RANGE);
    setStarRange(DEFAULT_STAR_RANGE);
    setRoomAmenityIds([]);
    setHotelAmenityIds([]);
    setFlexible([]);
    setSort(DEFAULT_SORT);
  };

  const renderCheckboxGroup = (
    options: { label: string; value: string | number }[],
    values: number[],
    onChange: (vals: number[]) => void,
    name?: string
  ) => {
    return (
      <div className="sr-checkbox-vertical">
        {options.map((opt) => {
          const valNum =
            typeof opt.value === "string" ? Number(opt.value) : opt.value;
          return (
            <Checkbox
              key={`${name || "opt"}-${opt.value}`}
              checked={values.includes(valNum)}
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) onChange([...values, valNum]);
                else onChange(values.filter((v) => v !== valNum));
              }}
            >
              {opt.label}
            </Checkbox>
          );
        })}
      </div>
    );
  };

  return (
    <div className="sr-page">
      <SearchResultsTopBar
        initialAvailability={availability}
        onReload={(data) => setAvailability(data)}
      />

      <div className="sr-container">
        <aside className="sr-sidebar">
          {/* Giá */}
          <div className="sr-panel">
            <div className="sr-panel__header">
              <span className="sr-panel__title">Khoảng giá</span>
            </div>
            <div className="sr-panel__sub">1 phòng, 1 đêm</div>
            <Slider
              range
              min={0}
              max={20000000}
              step={100000}
              tooltip={{
                formatter: (v) =>
                  v ? v.toLocaleString("vi-VN") + " VND" : "0",
              }}
              value={priceRange}
              onChange={(val) => setPriceRange(val as [number, number])}
            />
            <div className="sr-range-values">
              <span>{priceRange[0].toLocaleString("vi-VN")} VND</span>
              <span>{priceRange[1].toLocaleString("vi-VN")} VND</span>
            </div>
          </div>

          {/* Số sao */}
          <div className="sr-panel">
            <div className="sr-panel__header">
              <span className="sr-panel__title">Số sao (khoảng)</span>
            </div>
            <Slider
              range
              min={0}
              max={5}
              step={1}
              marks={{ 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" }}
              value={starRange}
              onChange={(v) => setStarRange(v as [number, number])}
            />
          </div>

          {/* Linh hoạt: refundableOnly & payAtHotelOnly */}
          <div className="sr-panel">
            <div className="sr-panel__header">
              <span className="sr-panel__title">Linh hoạt hơn</span>
            </div>
            {renderCheckboxGroup(
              flexibleOptions,
              flexible as any,
              (vals) => setFlexible(vals as any[]),
              "flexible"
            )}
          </div>

          {/* Tiện nghi phòng (Room) */}
          <div className="sr-panel">
            <div className="sr-panel__header">
              <span className="sr-panel__title">Tiện nghi phòng</span>
            </div>
            {amenityLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              renderCheckboxGroup(
                roomAmenitiesOptions,
                roomAmenityIds,
                (vals) => setRoomAmenityIds(vals),
                "roomAmenityIds"
              )
            )}
          </div>

          {/* Tiện nghi khách sạn (Hotel) */}
          <div className="sr-panel">
            <div className="sr-panel__header">
              <span className="sr-panel__title">Tiện nghi khách sạn</span>
            </div>
            {amenityLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              renderCheckboxGroup(
                hotelAmenitiesOptions,
                hotelAmenityIds,
                (vals) => setHotelAmenityIds(vals),
                "hotelAmenityIds"
              )
            )}
          </div>

          {/* Reset */}
          <div className="sr-panel">
            <Button block onClick={resetAllFilters}>
              Đặt lại tất cả bộ lọc
            </Button>
          </div>
        </aside>

        <main className="sr-results">
          <div className="sr-sortBar">
            <Space>
              <span>Xếp theo:</span>
              <Radio.Group
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <Radio.Button value="price_asc">Giá thấp nhất</Radio.Button>
                <Radio.Button value="price_desc">Giá cao nhất</Radio.Button>
              </Radio.Group>
            </Space>
          </div>
          {/* 
          <div className="sr-metaBar">
            {availability ? (
              <Space size={[8, 8]} wrap>
                <Tag color="blue">
                  {availability.meta.checkin} → {availability.meta.checkout} (
                  {availability.meta.nights} đêm)
                </Tag>
                <Tag color="geekblue">
                  Phòng: {availability.meta.requested_rooms}
                </Tag>
                <Tag color="green">NL: {availability.meta.adults}</Tag>
                <Tag color="orange">TE: {availability.meta.children}</Tag>
                <Tag color="purple">Tổng: {availability.meta.total_guests}</Tag>
                <Tag>{sortLabel}</Tag>
              </Space>
            ) : (
              <Spin size="small" />
            )}
          </div> */}
          <div className="sr-hotelList">
            {!availability && (
              <div className="sr-hotelList__empty">Đang tải...</div>
            )}
            {availability && availability.hotels.length === 0 && (
              <div className="sr-hotelList__empty">
                Không có khách sạn phù hợp.
              </div>
            )}
            {availability &&
              availability.hotels.map((h) => {
                const imgs: string[] = Array.isArray((h as any).images)
                  ? (h as any).images
                  : [];
                const main = imgs[0];
                const thumbs = imgs.slice(1, 4); // 3 ảnh nhỏ
                const extraCount = Math.max(0, imgs.length - 4);

                return (
                  <div
                    key={h.hotel_id}
                    className="sr-hotelCard"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const meta = availability.meta;
                      const qs = new URLSearchParams({
                        checkin: meta.checkin,
                        checkout: meta.checkout,
                        adults: String(meta.adults),
                        children: String(meta.children),
                        rooms: String(meta.requested_rooms),
                      }).toString();
                      navigate(`/hotel/${h.hotel_id}?${qs}`);
                    }}
                  >
                    <div className="sr-hotelCard__imageWrap">
                      {main ? (
                        <div className="sr-gallery">
                          <div className="sr-gallery__main">
                            <img
                              src={buildUrl(main)}
                              alt={h.hotel_name}
                              loading="lazy"
                            />
                          </div>

                          <div className="sr-gallery__thumbs">
                            {thumbs.map((f, idx) => {
                              const isLast = idx === thumbs.length - 1;
                              return (
                                <div
                                  className="sr-gallery__thumb"
                                  key={`${f}-${idx}`}
                                >
                                  <img
                                    src={buildUrl(f)}
                                    alt={`${h.hotel_name} - ảnh ${idx + 2}`}
                                    loading="lazy"
                                  />
                                  {isLast && extraCount > 0 && (
                                    <div className="sr-gallery__more">
                                      +{extraCount}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {thumbs.length < 3 &&
                              Array.from({ length: 3 - thumbs.length }).map(
                                (_, i) => (
                                  <div
                                    key={`ph-${i}`}
                                    className="sr-gallery__thumb sr-gallery__thumb--placeholder"
                                  >
                                    Ảnh
                                  </div>
                                )
                              )}
                          </div>
                        </div>
                      ) : (
                        <div className="sr-imagePlaceholder">Ảnh</div>
                      )}
                    </div>

                    <div className="sr-hotelCard__body">
                      <h3 className="sr-hotelCard__name">{h.hotel_name}</h3>
                      <div className="sr-hotelCard__address">
                        {h.address_line || h.address_line}
                      </div>
                      <div className="sr-hotelCard__stars">
                        {"★".repeat(h.star_rating || 0)}
                      </div>
                      <div className="sr-hotelCard__rating"></div>
                      <Space wrap className="sr-hotelCard__badges"></Space>
                    </div>

                    <div className="sr-hotelCard__priceArea">
                      <div className="sr-priceBlock"></div>
                      <Button type="primary" size="small">
                        {h.hotel_min_price}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
