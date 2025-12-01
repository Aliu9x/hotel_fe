import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { Card, Slider, Button, Tag, Space, message, Spin } from "antd";
import "./search-results.scss";

import SearchResultsTopBar from "./search.results.top.bar";
import type { AvailabilityResponse, IAvailabilityParams } from "@/types/global";
import {
  buildAvailabilityQuery,
  parseAvailabilityParamsFromURL,
} from "@/services/helper";
import { searchAvailability } from "@/services/api";

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

  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("priceMin")) || 0,
    Number(searchParams.get("priceMax")) || 0,
  ]);
  const [starRange, setStarRange] = useState<[number, number]>([
    Number(searchParams.get("starMin")) || 0,
    Number(searchParams.get("starMax")) || 5,
  ]);

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

  const applyFilters = async () => {
    if (!availability) return;
    const meta = availability.meta;
    const params: IAvailabilityParams = {
      checkin: meta.checkin,
      checkout: meta.checkout,
      adults: meta.adults,
      children: meta.children,
      rooms: meta.requested_rooms,
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
      q: searchParams.get("q") || undefined,
      starMin: starRange[0] || undefined,
      starMax: starRange[1] || undefined,
      priceMin: priceRange[0] || undefined,
      priceMax: priceRange[1] || undefined,
    };
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
  };

  return (
    <div className="sr-page">
      <SearchResultsTopBar
        initialAvailability={availability}
        onReload={(data) => setAvailability(data)}
      />

      <div className="sr-container">
        <aside className="sr-sidebar">
          <div className="sr-panel">
            <div className="sr-panel__header">
              <span className="sr-panel__title">Khoảng giá</span>
              <button
                className="sr-link-reset"
                onClick={() => setPriceRange([0, 0])}
              >
                Đặt lại
              </button>
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
            <Button
              type="primary"
              size="small"
              block
              style={{ marginTop: 12 }}
              onClick={applyFilters}
            >
              Áp dụng lọc
            </Button>
          </div>

          <div className="sr-panel">
            <div className="sr-panel__header">
              <span className="sr-panel__title">Số sao</span>
              <button
                className="sr-link-reset"
                onClick={() => setStarRange([0, 5])}
              >
                Đặt lại
              </button>
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
            <Button
              type="primary"
              size="small"
              block
              style={{ marginTop: 12 }}
              onClick={applyFilters}
            >
              Áp dụng lọc
            </Button>
          </div>
        </aside>

        <main className="sr-results">
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
              </Space>
            ) : (
              <Spin size="small" />
            )}
          </div>

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
              availability.hotels.map((h) => (
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
                    <div className="sr-imagePlaceholder">Ảnh</div>
                  </div>
                  <div className="sr-hotelCard__body">
                    <h3 className="sr-hotelCard__name">{h.hotel_name}</h3>
                  </div>
                  <div className="sr-hotelCard__priceArea">
                    <div className="sr-pricePlaceholder">Giá / Ưu đãi</div>
                    <Button type="primary" size="small">
                      Chọn phòng
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
