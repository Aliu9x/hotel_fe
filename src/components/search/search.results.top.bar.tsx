import React, { useState } from "react";
import { Button, Col, DatePicker, Popover, Row } from "antd";
import {
  CalendarOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import { useNavigate, useSearchParams } from "react-router-dom";
import { message } from "antd";

import type { IDestinationContext } from "./destination.search";
import type { IGuestsValue } from "./guest.selector";
import DestinationSearch from "./destination.search";
import GuestSelector from "./guest.selector";
import type { AvailabilityResponse, IAvailabilityParams } from "@/types/global";
import { searchAvailability } from "@/services/api";
import { buildAvailabilityQuery } from "@/services/helper";

const { RangePicker } = DatePicker;

interface Props {
  initialAvailability?: AvailabilityResponse;
  onReload: (data: AvailabilityResponse) => void;
}

const SearchResultsTopBar: React.FC<Props> = ({
  initialAvailability,
  onReload,
}) => {
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();

  const [destination, setDestination] = useState(urlParams.get("q") || "");
  const [destCtx, setDestCtx] = useState<IDestinationContext>({});
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
    urlParams.get("checkin") ? dayjs(urlParams.get("checkin")!) : dayjs(),
    urlParams.get("checkout")
      ? dayjs(urlParams.get("checkout")!)
      : dayjs().add(1, "day"),
  ]);
  const [guests, setGuests] = useState<IGuestsValue>({
    adults:
      Number(urlParams.get("adults")) || initialAvailability?.meta.adults || 2,
    children:
      Number(urlParams.get("children")) ||
      initialAvailability?.meta.children ||
      0,
    rooms:
      Number(urlParams.get("rooms")) ||
      initialAvailability?.meta.requested_rooms ||
      1,
  });

  const [guestVisible, setGuestVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    if (!dates[0] || !dates[1]) {
      message.error("Chọn ngày");
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
      const availability = res.data;
      onReload(availability);
      const qs = buildAvailabilityQuery(params);
      navigate(`/search-results?${qs}`, {
        replace: true,
        state: { availability },
      });
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || "Tìm kiếm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-topbar-wrapper">
      <div className="sr-topbar">
        <div className="sr-topbar__segment_fix sr-topbar__segment--destination">
          <DestinationSearch
            initialValue={destination}
            onSelectionChange={(d, ctx) => {
              setDestination(d);
              setDestCtx(ctx);
            }}
          />
        </div>
        <div className="sr-topbar__segment sr-topbar__segment--dates">
          <CalendarOutlined className="sr-topbar__icon" />
          <RangePicker
            bordered={false}
            format="DD [thg] MM YYYY"
            value={dates}
            onChange={(v) => setDates(v || [null, null])}
            separator="-"
            suffixIcon={null}
            style={{ width: "100%", fontSize: 15, fontWeight: 500 }}
          />
        </div>
        <div className="sr-topbar__segment sr-topbar__segment--guests">
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
            <div className="sr-topbar__guestTrigger">
              <UserOutlined className="sr-topbar__icon" />
              <span className="sr-topbar__guestText">
                {guests.adults} người lớn, {guests.children} Trẻ em,{" "}
                {guests.rooms} phòng
              </span>
            </div>
          </Popover>
        </div>
        <div className="sr-topbar__segment sr-topbar__segment--submit">
          <Button
            type="primary"
            icon={<SearchOutlined style={{ fontSize: 20 }} />}
            loading={loading}
            onClick={runSearch}
            className="sr-topbar__btn"
          >
            Tìm khách sạn
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsTopBar;
