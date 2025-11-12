import axios from "services/axios.customize";
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
  fullName: string
) => {
  const urlBackend = "/api/v1/user/register";
  return axios.post<IBackendRes<ILogin>>(urlBackend, {
    email,
    phone,
    password,
    fullName,
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

export const getUserApi = (query: string) => {
  const urlBackend = `/api/v1/user?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(urlBackend);
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

export const loadImageRoomType = async (id: string) => {
  const urlBackend = `/api/v1/room-types/load-images/${id}`;
  return axios.get<IBackendRes<ILoadImage>>(urlBackend);
};

export const commitUpload = (data: ICommitUpload) => {
  return axios.post<IBackendRes<any>>("/api/v1/files/commit", data);
};

export const getCategories = (id: string) => {
  const urlBackend = `/api/v1/amenity-category?applies_to=${id}`;
  return axios.get<IBackendRes<ICategory[]>>(urlBackend);
};

export const createAmenityMappings = (room_type_id: any, amenity_ids: any) => {
  const urlBackend = "/api/v1/amenity-mappings";
  return axios.post<IBackendRes<ICategory[]>>(urlBackend, {
    room_type_id,
    amenity_ids,
  });
};

export const getAmenityMappings = (id?: string) => {
  const urlBackend = `/api/v1/amenity-mappings?room_type_id=${id}`;
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

// export function uploadTmp(file: File | Blob) {
//   const form = new FormData();
//   form.append('fileImg', file);
//   return API.post<BackendRes<{ fileUploaded: string; tmpRelativePath: string }>>(
//     '/api/v1/file/upload',
//     form,
//     { headers: { 'Content-Type': 'multipart/form-data' } },
//   );
// }
