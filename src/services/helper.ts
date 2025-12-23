import type { IAvailabilityParams } from "@/types/global";
import dayjs from "dayjs";

export const FORMATE_DATE = "YYYY-MM-DD";
export const MAX_UPLOAD_IMAGE_SIZE = 2;

export const dateRangeValidate = (dateRange: any) => {
  if (!dateRange) return undefined;

  const startDate = dayjs(dateRange[0], FORMATE_DATE).toDate();
  const endDate = dayjs(dateRange[1], FORMATE_DATE).toDate();

  return [startDate, endDate];
};
/////////////////////////////////hotel//////////
export const buildGetAllHotels = (params?: string | any) => {
  let queryString = "";
  if (typeof params === "string") {
    queryString = params;
  } else if (params && typeof params === "object") {
    queryString = buildQuery(params);
  }
  return queryString;
};


///////////////////////////////////////local /////////////
export const buildQuery = (params?: Record<string, any>) => {
  if (!params) return "";
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
  });
  const q = qs.toString();
  return q ? `?${q}` : "";
};



///////////////////////////////url Search///////
export const buildAvailabilityQuery = (params: IAvailabilityParams) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      v.forEach(item => qs.append(k, String(item)));
    } else {
      qs.append(k, String(v));
    }
  });
  return qs.toString();
};

export const parseAvailabilityParamsFromURL = (search: string): Partial<IAvailabilityParams> => {
  const qs = new URLSearchParams(search);

  const num = (key: string): number | undefined => {
    const raw = qs.get(key);
    if (!raw) return undefined;
    const val = Number(raw);
    return Number.isNaN(val) ? undefined : val;
  };

  const nums = (key: string): number[] | undefined => {
    const items = qs.getAll(key);
    const arr = items.map(s => Number(s)).filter(n => !Number.isNaN(n));
    return arr.length ? arr : undefined;
  };

  const bool = (key: string): boolean | undefined => {
    const raw = qs.get(key);
    if (raw === null) return undefined;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return undefined;
  };

  const sort = (): 'asc' | 'desc' | undefined => {
    const raw = qs.get('sortPrice');
    if (raw === 'asc' || raw === 'desc') return raw;
    return undefined;
  };

  return {
    checkin: qs.get('checkin') || undefined,
    checkout: qs.get('checkout') || undefined,
    adults: num('adults'),
    children: num('children'),
    rooms: num('rooms'),
    provinceId: num('provinceId'),
    districtId: num('districtId'),
    wardId: num('wardId'),
    hotelId: num('hotelId'),

    // amenities: ép về number[]
    hotelAmenityIds: nums('hotelAmenityIds'),
    roomAmenityIds: nums('roomAmenityIds'),

    // ranges
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    minStar: num('minStar'),
    maxStar: num('maxStar'),

    // checkboxes
    refundableOnly: bool('refundableOnly'),
    payAtHotelOnly: bool('payAtHotelOnly'),

    // sort
    sortPrice: sort(),
  };
};