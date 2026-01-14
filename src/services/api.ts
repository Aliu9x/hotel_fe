import type {
  AvailabilityResponse,
  CreateBookingPayload,
  HotelRoomTypesResponse,
  IAvailabilityParams,
  ISuggestItem,
  ModerationStatus,
} from "@/types/global";
import axios from "services/axios.customize";
import {
  buildAvailabilityQuery,
  buildGetAllHotels,
  buildQuery,
} from "./helper";
import type { HotelApprovalStatus, Role } from "@/types/file.constants";
const headers = {
  delay: 1000,
};
export const loginApi = (username: string, password: string) => {
  const urlBackend = "/api/v1/auth/login";
  return axios.post<IBackendRes<ILogin>>(
    urlBackend,
    { username, password },
    { headers: { delay: 1000 } }
  );
};

export const registerApi = (
  email: string,
  password: string,
  phone: string,
  fullName: string,
  role: string
) => {
  const urlBackend = "/api/v1/auth/register";
  return axios.post<IBackendRes<ILogin>>(urlBackend, {
    email,
    phone,
    password,
    fullName,
    role,
  });
};

export const fetchAccountApi = () => {
  const urlBackend = "/api/v1/auth/account";
  return axios.get<any>(urlBackend, { headers });
};

export const logoutApi = () => {
  const urlBackend = "/api/v1/auth/logout";
  return axios.post(urlBackend, { headers });
};

export const getUserApi = (params: UserQuery) => {
  const queryNew = buildGetAllHotels(params);
  const urlBackend = `/api/v1/users${queryNew}`;
  return axios.get<any>(urlBackend);
};

export const createUserApi = (payload: any) => {
  const urlBackend = `/api/v1/users`;
  return axios.post<any>(urlBackend, payload);
};

export const updateUserApi = (
  id: string,
  body: Partial<{
    full_name: string;
    email: string | null;
    phone: string | null;
    role: Role;
    status: "SUSPENDED" | "APPROVED";
  }>
) => {
  return axios.patch(`/api/v1/users/${id}`, body);
};
///////////////////////////////////////////////////////////////////////////////////

export const getRoomType = (query: string) => {
  const urlBackend = `/api/v1/room-types?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IRoomType>>>(urlBackend);
};

export const updateRoomType = (id: string, update: Partial<IRoomType>) => {
  const urlBackend = `/api/v1/room-types/${id}`;
  return axios.patch<IBackendRes<IRoomType>>(urlBackend, update);
};

export const deleteRoomType = (id: string) => {
  const urlBackend = `/api/v1/room-types/${id}`;
  return axios.delete<IBackendRes<IRoomType>>(urlBackend);
};

export const getRoomTypeById = (id: string) => {
  const urlBackend = `/api/v1/room-types/${id}`;
  return axios.get<IBackendRes<IRoomType>>(urlBackend);
};

export const createRoomType = (create: IRoomType) => {
  const urlBackend = "/api/v1/room-types";
  return axios.post<IBackendRes<IRoomType>>(urlBackend, create);
};
/////////////////////////
export const getRatePlans = (params?: IListRatePlanParams) => {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
    });
  }
  return axios.get<IBackendRes<IModelPaginate<IRatePlan>>>(
    `/api/v1/rate-plans?${qs.toString()}`
  );
};

export const createRatePlan = (payload: ICreateRatePlanPayload) => {
  return axios.post<IBackendRes<IRatePlan>>("/api/v1/rate-plans", payload);
};

export const updateRatePlan = (id: string, payload: IUpdateRatePlanPayload) => {
  return axios.patch<IBackendRes<IRatePlan>>(
    `/api/v1/rate-plans/${id}`,
    payload
  );
};

export const deleteRatePlan = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/api/v1/rate-plans/${id}`);
};

export const geRatePlanById = (id: string) => {
  return axios.get<IBackendRes<null>>(`/api/v1/rate-plans/${id}`);
};
/////////////////////////////////
export const loadImageRoomType = async (id: string) => {
  const urlBackend = `/api/v1/room-types/load-images/${id}`;
  return axios.get<IBackendRes<ILoadImage>>(urlBackend);
};

export const commitUpload = (data: ICommitUpload) => {
  return axios.post<IBackendRes<any>>("/api/v1/files/commit", data);
};

export const getAmenityCategory = (type: string) => {
  const urlBackend = `/api/v1/amenity-category/type?applies_to=${type}`;
  return axios.get<IBackendRes<ICategory[]>>(urlBackend);
};

export const updateAmenitySearch = (id: string, active: boolean) => {
  const urlBackend = `/api/v1/amenity-category/${id}`;
  return axios.post<IBackendRes<ICategory[]>>(urlBackend, { active });
};

export const getAmenitySearch = (type: string) => {
  const urlBackend = `/api/v1/amenity-category/filter?applies_to=${type}`;
  return axios.get<IBackendRes<ICategory[]>>(urlBackend);
};

////////////////////////////////////////////////////////////////////
export interface IListCategoriesParams {
  q?: string;
  applies_to?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
}

export const getAllAmenityCategory = (
  params?: string | IListCategoriesParams
) => {
  let queryString = "";
  if (typeof params === "string") {
    queryString = params;
  } else if (params && typeof params === "object") {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key as keyof IListCategoriesParams];
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    queryString = queryParams.toString();
  }
  const urlBackend = `/api/v1/amenity-category${
    queryString ? `?${queryString}` : ""
  }`;
  return axios.get<IBackendRes<IModelPaginate<ICategory>>>(urlBackend);
};

export const createAmenityCategory = (payload: ICreateCategoryPayload) => {
  const urlBackend = `/api/v1/amenity-category`;
  return axios.post<IBackendRes<ICategory>>(urlBackend, payload);
};

export const updateAmenityCategory = (
  id: string,
  payload: IUpdateCategoryPayload
) => {
  const urlBackend = `/api/v1/amenity-category/${id}`;
  return axios.patch<IBackendRes<ICategory>>(urlBackend, payload);
};

export const deleteAmenityCategory = (id: string) => {
  const urlBackend = `/api/v1/amenity-category/${id}`;
  return axios.delete<IBackendRes<null>>(urlBackend);
};

export const getAllHotels = (queryString?: string | IListHotelsParams) => {
  const queryNew = buildGetAllHotels(queryString);
  const url = `/api/v1/hotels/${queryNew}`;
  return axios.get<IBackendRes<IModelPaginate<IHotel>>>(url);
};

export const getHotelById = (id: string) => {
  const url = `/api/v1/hotels/${id}`;
  return axios.get<any>(url);
};
export const updateHotelApproval = (
  id: string | number,
  status: HotelApprovalStatus
) => {
  const url = `/api/v1/hotels/${id}/approval`;
  return axios.patch<IBackendRes<IModelPaginate<IHotel>>>(url, { status });
};

///////////////////////////////////////////////////
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

export async function createHotel(payload: CreateHotelPayload) {
  const res = await axios.post("/api/v1/hotels", payload);
  const data = res.data?.data ?? res.data;
  return data;
}

export async function uploadContractFiles(options: {
  contract_pdf?: File | null;
  identity_doc?: File | null;
  id_hotel: string;
}) {
  const fd = new FormData();
  fd.append("id_hotel", options.id_hotel);
  if (options.contract_pdf) fd.append("contract_pdf", options.contract_pdf);
  if (options.identity_doc) fd.append("identity_doc", options.identity_doc);
  const res = await axios.post("/api/v1/hotels/contract/files", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = res.data?.data ?? res.data;
  return data as {
    contract_pdf_filename?: string;
    identity_doc_filename?: string;
  };
}

export async function updateHotelContract(payload: {
  id_hotel: string;
  legal_name: string;
  legal_address: string;
  signer_full_name: string;
  signer_phone: string;
  signer_email: string;
  identity_doc_filename?: string;
  contract_pdf_filename?: string;
}) {
  const res = await axios.put("/api/v1/hotels/contract", payload);
  const data = res.data?.data ?? res.data;
  return data;
}

export async function getMyHotel() {
  const res = await axios.get("/api/v1/hotels/me");
  return res.data?.data ?? res.data;
}

export async function submitRegistration(hotelId: number | string) {
  console.log("[API] submitRegistration with hotelId =", hotelId);
  await new Promise((r) => setTimeout(r, 400));
  return { status: "PENDING", hotelId };
}
/////////////////////////////

export const createHotel1 = (payload: ICreateHotelPayload) => {
  return axios.post<IBackendRes<IHotel>>("/api/v1/hotels", payload);
};

export const updateHotel = (
  id: string,
  payload: Partial<ICreateHotelPayload>
) => {
  return axios.patch<IBackendRes<IHotel>>(`/api/v1/hotels/${id}`, payload);
};

export const createAmenityMappings = (room_type_id: any, amenity_ids: any) => {
  const urlBackend = "/api/v1/amenity-mappings";
  return axios.post<IBackendRes<ICategory[]>>(urlBackend, {
    room_type_id,
    amenity_ids,
  });
};

export const loadImageHotel = () => {
  const urlBackend = "/api/v1/hotels/load-images";
  return axios.get<IBackendRes<ILoadImage>>(urlBackend);
};

export const getAmenityMappings = (id?: string) => {
  const urlBackend = `/api/v1/amenity-mappings?room_type_id=${id}`;
  return axios.get<IBackendRes<ICategory[]>>(urlBackend);
};
export const getAmenityMappingsHotel = () => {
  const urlBackend = `/api/v1/amenity-mappings`;
  return axios.get<IBackendRes<ICategory[]>>(urlBackend);
};

export const getAmenityMappingsHotelUser = (id: string) => {
  const urlBackend = `/api/v1/amenity-mappings/hotel`;
  return axios.post<IBackendRes<ICategory[]>>(urlBackend, id);
};

export const getHotelPolicies = () => {
  const urlBackend = "/api/v1/hotel-policies";
  return axios.get<IBackendRes<IHotelPolicy>>(urlBackend);
};

export const createOrUpdateHotelPolicies = (create: IHotelPolicy) => {
  const urlBackend = "/api/v1/hotel-policies";
  return axios.post<IBackendRes<IHotelPolicy>>(urlBackend, create);
};

export const uploadFileAPI = (fileImg: any, folder: string) => {
  const bodyFormData = new FormData();
  bodyFormData.append("fileImg", fileImg);
  return axios<
    IBackendRes<{
      fileUploaded: string;
    }>
  >({
    method: "post",
    url: "/api/v1/files/upload",
    data: bodyFormData,
    headers: {
      "Content-Type": "multipart/form-data",
      "upload-type": folder,
    },
  });
};
////////////////////////inventories////////////

export const getInventories = (params: {
  roomTypeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}) => {
  return axios.get("/api/v1/inventories", { params });
};
///////////////////////////////////////////
export const getProvinces = (params?: IListProvinceParams) =>
  axios.get<IBackendRes<IModelPaginate<IProvince>>>(
    `/api/v1/locations/provinces${buildQuery(params)}`
  );

export const getDistricts = (params: IListDistrictParams) =>
  axios.get<IBackendRes<IModelPaginate<IDistrict>>>(
    `/api/v1/locations/districts${buildQuery(params)}`
  );

export const getWards = (params: IListWardParams) =>
  axios.get<IBackendRes<IModelPaginate<IWard>>>(
    `/api/v1/locations/wards${buildQuery(params)}`
  );

export const importProvinces = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post<IBackendRes<{ count: number }>>(
    "/api/v1/admin/locations/provinces/import",
    form
  );
};

export const importDistricts = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post<IBackendRes<{ count: number }>>(
    "/api/v1/admin/locations/districts/import",
    form
  );
};

export const importWards = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post<IBackendRes<{ count: number }>>(
    "/api/v1/admin/locations/wards/import",
    form
  );
};
///////////////////////////////////////////////search////////////////

export async function suggestSearch(q: string, limit = 12, types?: string) {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(limit));
  if (types) params.set("types", types);
  const res = await axios.get<{
    data: ISuggestItem[] | any;
  }>(`/api/v1/search/suggest?${params.toString()}`);
  const payload = res.data;
  return Array.isArray(payload) ? (payload as ISuggestItem[]) : [];
}

export const searchAvailability = async (params: IAvailabilityParams) => {
  const query = buildAvailabilityQuery(params);
  const url = `/api/v1/search/availability?${query}`;
  return axios.post<{ data: AvailabilityResponse }>(url);
};
////////////////////////////

export const fetchHotelRoomTypes = async (params: IHotelRoomTypesParams) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => qs.append(k, String(v)));
  const url = `/api/v1/search/hotel-room-types?${qs.toString()}`;
  return axios.get<{ data: HotelRoomTypesResponse }>(url);
};

/////////////////////////boongKing//////////////////
export async function updateBooking(payload: any, id: string) {
  const url = `/api/v1/bookings/${id}`;
  return axios.patch<IBackendRes<CreateBookingPayload>>(url, payload);
}

export async function holdBooking(payload: any) {
  const url = "/api/v1/bookings/hold";
  return axios.post<IBackendRes<CreateBookingPayload>>(url, payload);
}
export async function startMomoPayment(bookingId: string | number) {
  const url = `api/v1/bookings/${bookingId}/pay/momo`;
  const resp = await axios.post(url);
  const payload = resp?.data?.data ?? resp?.data;
  return {
    bookingId: payload?.bookingId,
    payUrl: payload?.payUrl,
    orderId: payload?.orderId,
    requestId: payload?.requestId,
  };
}

export const reserveBooking = async (bookingId: number) => {
  const res = await axios.post<{ data: any }>("/api/v1/bookings/reserve", {
    bookingId,
  });
  return res.data;
};

export const cancelHold = async (bookingId: number) => {
  const res = await axios.post<{ data: any }>("/api/v1/bookings/cancel-hold", {
    bookingId,
  });
  return res.data;
};

export const updatePaymentMethod = async (
  bookingId: string,
  paymentType: string
) => {
  const res = await axios.post<{ data: any }>("/api/v1/bookings/payment-type", {
    bookingId,
    paymentType,
  });
  return res.data;
};

export async function getBooking(bookingId: string | number) {
  const url = `/api/v1/bookings/${bookingId}`;
  return axios.get<any>(url);
}
///////////////////////duyet anh ks//////////////// axios
export async function loadAllModerationImage() {
  const url = `/api/v1/files/flagged`;
  return axios.get<any>(url);
}

export async function updateModerationImageHotel(
  id: string | number,
  status: ModerationStatus
) {
  const url = `/api/v1/files/hotel/${id}/status`;
  return axios.patch<{
    result: { id: string; status: ModerationStatus };
  }>(url, { status });
}

export async function updateModerationImageRoomType(
  id: string | number,
  status: ModerationStatus
) {
  const url = `/api/v1/files/room-type/${id}/status`;
  return axios.patch<{
    result: { id: string; status: ModerationStatus };
  }>(url, { status });
}

/////////////////////
export async function loadloadImageByHotel(id: string) {
  const url = `/api/v1/hotels/images/${id}`;
  return axios.get<any>(url);
}
/////////////////
export async function createRoomCategory(name: string) {
  const url = `/api/v1/room-type-category`;
  return axios.post<any>(url, { name: name.trim() });
}

export async function updateRoomCategory(id: string, name: string) {
  const url = `/api/v1/room-type-category/${id}`;
  return axios.post<any>(url, name);
}

export async function getAllRoomCategory() {
  const url = `/api/v1/room-type-category`;
  return axios.get<any>(url);
}

export async function getOneRoomCategory(id: string) {
  const url = `/api/v1/room-type-category/${id}`;
  return axios.get<any>(url);
}

////////////////////
export async function createRatePlanCategory(name: string) {
  const url = `/api/v1/rate-plan-category`;
  return axios.post<any>(url, { name: name.trim() });
}

export async function updateRatePlanCategory(id: string, name: string) {
  const url = `/api/v1/rate-plan-category/${id}`;
  return axios.post<any>(url, name);
}

export async function getAllRatePlanCategory() {
  const url = `/api/v1/rate-plan-category`;
  return axios.get<any>(url);
}

export async function getOneRatePlanCategory(id: string) {
  const url = `/api/v1/rate-plan-category/${id}`;
  return axios.get<any>(url);
}

////////////boooking////////////////

export async function getMyBooking() {
  const url = `/api/v1/bookings/my-bookings`;
  return axios.get<any>(url);
}

export function getOwnerBookings(params: {
  from?: string;
  to?: string;
  keyword?: string;
}) {
  return axios.get("/api/v1/bookings/owner-bookings", { params });
}

export function cancelBooking(id: string) {
  return axios.patch(`/api/v1/bookings/${id}/cancel`);
}
