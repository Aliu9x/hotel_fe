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
  return axios.get<IBackendRes<IFetchAccount>>(urlBackend, { headers });
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

export async function uploadContractFiles(
  _unusedHotelId: number | string,
  options: { contract_pdf?: File | null; identity_doc?: File | null }
) {
  const fd = new FormData();
  if (options.contract_pdf) fd.append("contract_pdf", options.contract_pdf);
  if (options.identity_doc) fd.append("identity_doc", options.identity_doc);
  console.log("[API] uploadContractFiles formData =", {
    contract_pdf: options.contract_pdf?.name,
    identity_doc: options.identity_doc?.name,
  });
  const res = await axios.post("/api/v1/hotels/contract/files", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = res.data?.data ?? res.data;
  console.log("[API] uploadContractFiles response =", data);
  return data as {
    contract_pdf_filename?: string;
    identity_doc_filename?: string;
  };
}

export async function updateHotelContract(
  _unusedHotelId: number | string,
  payload: {
    legal_name: string;
    legal_address: string;
    signer_full_name: string;
    signer_phone: string;
    signer_email: string;
    identity_doc_filename?: string;
    contract_pdf_filename?: string;
  }
) {
  console.log("[API] updateHotelContract payload =", payload);
  const res = await axios.put("/api/v1/hotels/contract", payload);
  const data = res.data?.data ?? res.data;
  console.log("[API] updateHotelContract response =", data);
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

export const getInventoriesRange = (params: IGetInventoryParams) => {
  const urlBackend = `/api/v1/inventories`;
  return axios.get<IBackendRes<IInventory[]>>(urlBackend, { params });
};

export const createInventory = (payload: ICreateInventoryPayload) => {
  const urlBackend = `/api/v1/inventories`;
  return axios.post<IBackendRes<IInventory>>(urlBackend, payload);
};

export const updateInventory = (
  id: string,
  payload: IUpdateInventoryPayload
) => {
  const urlBackend = `/api/v1/inventories/${id}`;
  return axios.put<IBackendRes<IInventory>>(urlBackend, payload);
};

export const adjustInventory = (
  id: string,
  payload: IAdjustInventoryPayload
) => {
  const urlBackend = `/api/v1/inventories/${id}/adjust`;
  return axios.patch<IBackendRes<IInventory>>(urlBackend, payload);
};

export const reserveInventory = (payload: IReserveInventoryPayload) => {
  const urlBackend = `/api/v1/inventories/reserve`;
  return axios.post<IBackendRes<IReserveCancelResult>>(urlBackend, payload);
};

export const cancelReservation = (payload: ICancelReservationPayload) => {
  const urlBackend = `/api/v1/inventories/cancel`;
  return axios.post<IBackendRes<IReserveCancelResult>>(urlBackend, payload);
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
export async function createBooking(payload: any) {
  const url = "/api/v1/bookings";
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
  bookingId: number,
  paymentMethod: string
) => {
  const res = await axios.post<{ data: any }>(
    "/api/v1/bookings/payment-method",
    {
      bookingId,
      paymentMethod,
    }
  );
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
export async function loadloadImageByHotel(id:string) {
  const url = `/api/v1/hotels/images/${id}`;
  return axios.get<any>(url);
}
