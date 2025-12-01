export {};

declare global {
  interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
  }

  interface IModelPaginate<T> {
    meta: {
      page: number;
      limit: number;
      pages: number;
      total: number;
    };
    result: T[];
  }

  interface IPaginateMeta {
    page: number;
    limit: number;
    pages: number;
    total: number;
  }
  interface ILogin {
    access_token: string;
    user: IUser;
  }
  interface IUser {
    email: string;
    phone: string;
    fullName: string;
    role: string;
    avatar: string;
    id: string;
  }

  interface IFetchAccount {
    user: IUser;
  }

  interface IUserTable {
    _id: string;
    email: string;
    phone: string;
    fullName: string;
    role: string;
    avatar: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  // ////////////////////////////////////////////////

  interface IRoomType {
    id: string;
    hotel_id: string;
    name: string;
    description?: string | null;
    total_rooms?: number | null;
    max_adults: number;
    max_children: number;
    max_occupancy: number;
    bed_config?: string | null;
    room_size_label?: string | null;
    floor_level?: string | null;
    smoking_allowed: boolean;
    view?: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }

  ////////////////////////

  type MealPlanType = "NONE" | "BREAKFAST" | "HALF_BOARD" | "FULL_BOARD";
  type RatePlanType = "REFUNDABLE" | "NON_REFUNDABLE" | "SEMI_FLEX";

  interface IRatePlan {
    id: string;
    hotel_id: string;
    room_type_id: string;
    name: string;
    price_amount: string;
    description?: string;
    meal_plan?: MealPlanType;
    type: RatePlanType;
    base_occupancy: number;
    max_occupancy: number;
    extra_adult_fee: string;
    extra_child_fee: string;
    prepayment_required: boolean;
    created_at: string;
    updated_at: string;
  }

  interface IListRatePlanParams {
    q?: string;
    room_type_id?: string;
    page?: number;
    limit?: number;
    orderBy?: "created_at" | "updated_at" | "price_amount" | "name";
    order?: "ASC" | "DESC";
  }

  interface ICreateRatePlanPayload {
    // hotel_id sẽ set ở FE = user.hotel_id
    hotel_id: string;
    room_type_id: string;
    name: string;
    price_amount: string;
    description?: string;
    meal_plan?: MealPlanType;
    type: RatePlanType;
    base_occupancy: number;
    max_occupancy: number;
    extra_adult_fee: string;
    extra_child_fee: string;
    prepayment_required: boolean;
  }

  interface IUpdateRatePlanPayload extends Partial<ICreateRatePlanPayload> {}

  ///////////////////////
  interface IUpdateRatePlanPayload extends Partial<ICreateRatePlanPayload> {}
  interface ICommitFile {
    tmpFileName: string;
    originalName?: string;
  }

  interface ICommitUpload {
    folderType: FolderType;
    hotelId?: string;
    roomTypeId?: string;
    userId?: string;
    files: ICommitFile[];
  }

  interface IAmenity {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }

  interface ICategory {
    id: string;
    name_category: string;
    applies_to: "Hotel" | "Room";
    is_active: boolean;
    amenities: IAmenity[];
    created_at: string;
    updated_at: string;
  }

  interface IListCategoriesParams {
    q?: string;
    applies_to?: "Hotel" | "Room";
    page?: number;
    limit?: number;
    orderBy?: "id" | "name_category" | "created_at" | "updated_at";
    order?: "ASC" | "DESC";
  }

  interface IHotelPolicy {
    hotel_id?: string;
    default_checkin_time?: string;
    default_checkout_time?: string;
    house_rules?: string;
    children_policy?: string;
    smoking_policy?: string;
    pets_policy?: string;
    other_policies?: string;
  }

  interface ILoadImage {
    thumbnail: string;
    slider: string[];
  }

  interface ICreateCategoryPayload {
    category: string;
    applies_to: AmenityApplyTo;
    is_active?: boolean;
    amenities: Array<{ name: string }>;
  }

  interface IUpdateCategoryPayload {
    category: string;
    applies_to: "Hotel" | "Room";
    is_active: boolean;
    amenities: Array<{ id?: string; name: string }>;
  }
  export type HotelApprovalStatus = "PENDING" | "APPROVED" | "SUSPENDED";

  export interface CreateHotelPayload {
    registration_code: string;
    approval_status: "PENDING" | "APPROVED";
    name: string;
    description?: string;
    star_rating?: number;
    address_line?: string;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
  }

  export interface UpdateContractPayload {
    legal_name: string;
    legal_address: string;
    business_license_filename?: string;
    signer_type: string;
    signer_full_name: string;
    signer_position: string;
    signer_country_code: string;
    signer_phone: string;
    signer_email: string;
    identity_doc_filename: string;
    contract_pdf_filename?: string;
  }
  export interface IHotel {
    id: string;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address_line?: string;
    ward?: string;
    district?: string;
    city?: string;
    province?: string;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    country_code?: string;
    timezone?: string;
    approval_status: HotelApprovalStatus;
    star_rating?: number;
    created_at?: string;
    updatedAt?: string;
  }

  // Payload tạo hotel – dùng ID, không cần truyền text province/district/ward
  interface ICreateHotelPayload {
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address_line?: string;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    city?: string;
    star_rating?: number;
    country_code?: string;
    timezone?: string;
    approval_status?: HotelApprovalStatus;
  }
  export interface IHotelRoomTypesParams {
    hotelId: number;
    checkin: string;
    checkout: string;
    adults: number;
    children: number;
    rooms: number;
  }

  interface IListHotelsParams {
    q?: string;
    city?: string;
    provinceId?: number;
    districtId?: number;
    wardId?: number;
    status?: HotelApprovalStatus;
    page?: number;
    limit?: number;
    orderBy?: "created_at" | "name" | "star_rating" | "updatedAt";
    order?: "ASC" | "DESC";
    starMin?: number;
    starMax?: number;
  }

  ////////////////////////////////////////Inventory//////////
  interface IInventory {
    id: string;
    hotelId: string;
    roomTypeId: string;
    inventoryDate: string; // YYYY-MM-DD
    totalRooms: number;
    availableRooms: number;
    blockedRooms: number;
    roomsSold: number;
    stopSell: boolean;
    createdAt: string; // ISO
    updatedAt: string; // ISO
  }

  interface IGetInventoryParams {
    hotelId: number;
    roomTypeId: number;
    fromDate: string; // YYYY-MM-DD
    toDate: string; // YYYY-MM-DD
  }

  interface ICreateInventoryPayload {
    hotelId: number;
    roomTypeId: number;
    inventoryDate: string; // YYYY-MM-DD
    totalRooms: number;
    availableRooms: number;
    blockedRooms: number;
    roomsSold: number;
    stopSell: boolean;
  }

  interface IUpdateInventoryPayload {
    totalRooms?: number;
    availableRooms?: number;
    blockedRooms?: number;
    roomsSold?: number;
    stopSell?: boolean;
  }

  interface IAdjustInventoryPayload {
    deltaTotalRooms?: number;
    deltaAvailableRooms?: number;
    deltaBlockedRooms?: number;
    deltaRoomsSold?: number;
    overrideTotalRooms?: number;
    overrideAvailableRooms?: number;
    overrideBlockedRooms?: number;
    overrideRoomsSold?: number;
    stopSell?: boolean;
  }

  interface IReserveInventoryPayload {
    hotelId: number;
    roomTypeId: number;
    fromDate: string; // YYYY-MM-DD
    toDate: string; // YYYY-MM-DD
    quantity: number;
  }

  interface ICancelReservationPayload {
    hotelId: number;
    roomTypeId: number;
    fromDate: string; // YYYY-MM-DD
    toDate: string; // YYYY-MM-DD
    quantity: number;
  }

  interface IReserveCancelResult {
    dates: string[];
    quantity: number;
  }

  interface IProvince {
    id: number;
    code: string;
    name: string;
    type: string;
    slug: string;
  }

  interface IDistrict {
    id: number;
    code: string;
    name: string;
    type: string;
    slug: string;
    province_id: number;
  }

  interface IWard {
    id: number;
    code: string;
    name: string;
    type: string;
    slug: string;
    district_id: number;
  }

  interface IListProvinceParams {
    page?: number;
    limit?: number;
    search?: string;
  }

  interface IListDistrictParams extends IListProvinceParams {
    provinceId: number;
  }

  interface IListWardParams extends IListProvinceParams {
    districtId: number;
  }
}
////////////////////Type search/////////
export interface RoomTypeAvailability {
  room_type_id: number;
  name: string;
  description?: string;
  capacity: {
    max_adults: number;
    max_children: number;
    max_occupancy: number;
  };
  min_available_rooms: number;
  total_rooms: number;
  can_fulfill: boolean;
  avg_price?: number;
}

export interface HotelAvailability {
  hotel_id: number;
  hotel_name: string;
  star_rating?: number;
  address_line?: string;
  province?: string;
  district?: string;
  ward?: string;
  matched_room_types: RoomTypeAvailability[];
}

export interface AvailabilityMeta {
  checkin: string;
  checkout: string;
  nights: number;
  requested_rooms: number;
  adults: number;
  children: number;
  total_guests: number;
}

export interface AvailabilityResponse {
  meta: AvailabilityMeta;
  hotels: HotelAvailability[];
}
export interface IAvailabilityParams {
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  provinceId?: number;
  districtId?: number;
  wardId?: number;
  hotelId?: number;
  starMin?: number;
  starMax?: number;
  priceMin?: number;
  priceMax?: number;
  amenityIds?: number[];
  q?: string;
}
export type SuggestType = "hotel" | "province" | "district" | "ward";
export interface ISuggestPart {
  text: string;
  matched: boolean;
}

export interface ILocationNode {
  id: number | string;
  name: string;
  code?: string;
}
export interface ISuggestHierarchy {
  province?: ILocationNode;
  district?: ILocationNode;
  ward?: ILocationNode;
  hotel?: ILocationNode;
}

export interface ISuggestItem {
  type: SuggestType;
  category: string;
  id: number | string;
  label: string;
  label_parts: ISuggestPart[];
  subtitle?: string;
  badge: string;
  badge_color: string;
  icon: string;
  province_id?: number;
  district_id?: number;
  ward_id?: number;
  hotel_id?: string | number;
  hierarchy: ISuggestHierarchy;
  full_path: string[];
  path_string: string;
}
///////////////////////////
export interface HotelRoomTypeDaily {
  date: string;
  total_rooms: number;
  available_rooms: number;
  blocked_rooms: number;
  rooms_sold: number;
  stop_sell: number;
  effective_available: number;
}

export interface RatePlanPrice {
  rate_plan_id: number;
  name: string;
  description?: string;
  meal_plan?: string;
  type?: string;
  base_occupancy: number;
  max_occupancy: number;
  extra_adult_fee: number;
  extra_child_fee: number;
  prepayment_required: boolean;
  price_amount: number;
  extra_adults: number;
  extra_children: number;
  nightly_total: number;
  stay_total: number;
  available_for_request: boolean;
  refundable: boolean;
}

export interface HotelRoomTypeAvailability {
  room_type_id: number;
  name: string;
  description?: string;
  capacity: {
    max_adults: number;
    max_children: number;
    max_occupancy: number;
  };
  capacity_ok: boolean;
  nights: number;
  continuous_inventory: boolean;
  min_available_rooms: number | null;
  can_fulfill: boolean;
  stop_sell_any: boolean;
  total_rooms_reference: number;
  daily: HotelRoomTypeDaily[];
  avg_price?: number;
  rate_plans: RatePlanPrice[];
}

export interface HotelRoomTypesResponse {
  meta: {
    hotel_id: number;
    checkin: string;
    checkout: string;
    nights: number;
    requested_rooms: number;
    adults: number;
    children: number;
    total_guests: number;
  };
  hotel: {
    id: number;
    name: string;
    star_rating?: number;
    address_line?: string;
    province?: string;
    district?: string;
    ward?: string;
  };
  room_types: HotelRoomTypeAvailability[];
}

// /////////////////////booking//////////////////
export interface CreateBookingPayload {
  hotelId: number;
  roomTypeId: number;
  ratePlanId: number;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  isSelfBook: number;
  guestName: string;
  specialRequests: string[];
  pricePerNight: number;
  prepayRequired: number;
  promoTag?: string;
}
