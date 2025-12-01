  import React, { useState } from "react";
  import { Button, Card, Col, DatePicker, message, Popover, Row } from "antd";
  import {
    CalendarOutlined,
    SearchOutlined,
    UserOutlined,
  } from "@ant-design/icons";
  import dayjs, { Dayjs } from "dayjs";

  import { useNavigate } from "react-router-dom";
  import "./home.hero.scss";
  import type { IDestinationContext } from "../search/destination.search";
  import type { IGuestsValue } from "../search/guest.selector";

  import DestinationSearch from "../search/destination.search";
  import GuestSelector from "../search/guest.selector";
  import type { AvailabilityResponse, IAvailabilityParams } from "@/types/global";
  import { searchAvailability } from "@/services/api";
  import { buildAvailabilityQuery } from "@/services/helper";

  const { RangePicker } = DatePicker;

  const HomeHero: React.FC = () => {
    const navigate = useNavigate();
    const [destination, setDestination] = useState("");
    const [destCtx, setDestCtx] = useState<IDestinationContext>({});
    const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
      dayjs(),
      dayjs().add(1, "day"),
    ]);
    const [guests, setGuests] = useState<IGuestsValue>({
      adults: 2,
      children: 0,
      rooms: 1,
    });
    const [guestVisible, setGuestVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(false);

    const   handleSearch = async () => {
      if (!dates[0] || !dates[1]) {
        message.error("Chọn ngày nhận và trả phòng");
        return;
      }
      const params: IAvailabilityParams = {
        checkin: dates[0].format("YYYY-MM-DD"),
        checkout: dates[1].format("YYYY-MM-DD"),
        adults: guests.adults,
        children: guests.children,
        rooms: guests.rooms,
        provinceId: destCtx.province_id,
        districtId: destCtx.district_id,
        wardId: destCtx.ward_id,
        hotelId: destCtx.hotel_id ? Number(destCtx.hotel_id) : undefined,
        q: destination.trim() || undefined,
      };
      setLoading(true);
      try {
        const res = await searchAvailability(params);
        const availability: AvailabilityResponse = res.data;
        const qs = buildAvailabilityQuery(params);
        navigate(`/search-results?${qs}`, {
          state: { availability, initialParams: params },
        });
      } catch (e: any) {
        console.error(e);
        message.error(e?.response?.data?.message || "Tìm kiếm thất bại");
      } finally {
        setLoading(false);
      }
    };

    return (
      <section className="home-hero">
        <div className="home-hero__bg" />
        <div className="global-container home-hero__inner">
          <h1 className="home-hero__title">
            Nghỉ dưỡng đẳng cấp - Giá cả bình dân
          </h1>
          <p className="home-hero__subtitle">
            Đặt phòng sớm - Ưu đãi lớn mỗi ngày
          </p>

          <div className="home-hero__tabs">
            {[
              { key: "all", label: "Tất cả" },
              { key: "hotel", label: "Khách sạn" },
              { key: "villa", label: "Biệt thự" },
              { key: "apartment", label: "Căn hộ" },
            ].map((t) => (
              <Button
                key={t.key}
                type={activeTab === t.key ? "primary" : "default"}
                onClick={() => setActiveTab(t.key)}
                className={`hero-tab ${
                  activeTab === t.key ? "hero-tab--active" : ""
                }`}
              >
                {t.label}
              </Button>
            ))}
          </div>

          <Card className="hero-searchCard" bodyStyle={{ padding: 0 }}>
            <Row gutter={0} align="middle" wrap={false}>
              <Col flex="1">
                <DestinationSearch
                  initialValue=""
                  onSelectionChange={(d, ctx) => {
                    setDestination(d);
                    setDestCtx(ctx);
                  }}
                />
              </Col>
              <Col flex="1" className="hero-segment hero-segment--withBorder">
                <CalendarOutlined className="hero-icon" />
                <RangePicker
                  bordered={false}
                  format="DD [thg] MM YYYY"
                  value={dates}
                  onChange={(v) => setDates(v || [null, null])}
                  separator="-"
                  suffixIcon={null}
                  style={{ width: "100%", fontSize: 15, fontWeight: 500 }}
                />
              </Col>
              <Col flex="1" className="hero-segment hero-segment--withBorder">
                <Popover
                  trigger="click"
                  open={guestVisible}
                  onOpenChange={setGuestVisible}
                  placement="bottom"
                  content={
                    <GuestSelector
                      value={guests}
                      onChange={setGuests}
                      onClose={() => setGuestVisible(false)}
                    />
                  }
                >
                  <div className="hero-guestTrigger">
                    <UserOutlined className="hero-icon" />
                    <span className="hero-guestText">
                      {guests.adults} người lớn, {guests.children} Trẻ em,{" "}
                      {guests.rooms} phòng
                    </span>
                  </div>
                </Popover>
              </Col>
              <Col>
                <Button
                  style={{ padding: "25px" }}
                  type="primary"
                  icon={<SearchOutlined style={{ fontSize: 20 }} />}
                  loading={loading}
                  onClick={handleSearch}
                  className="hero-searchBtn"
                />
              </Col>
            </Row>
          </Card>
        </div>
      </section>
    );
  };

  export default HomeHero;
