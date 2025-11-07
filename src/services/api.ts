import axios from "services/axios.customize";
const headers={
  delay:1000
}
export const loginApi = (username: string, password: string) => {
  const urlBackend = "/api/v1/auth/login";
  return axios.post<IBackendRes<ILogin>>(urlBackend, { username, password },{headers:{delay:1000}});
};

export const registerApi = (email: string, password: string,phone:string, fullName:string) => {
  const urlBackend = "/api/v1/user/register";
  return axios.post<IBackendRes<ILogin>>(urlBackend, { email,phone, password,fullName });
};

export const fetchAccountApi = () => {
  const urlBackend = "/api/v1/auth/account";
  return axios.get<IBackendRes<IFetchAccount>>(urlBackend,{headers});
};


export const logoutApi = () => {
  const urlBackend = "/api/v1/auth/logout";
  return axios.post(urlBackend,{headers});
};


export const getUserApi= (query:string) => {
  const urlBackend = `/api/v1/user?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(urlBackend);
};
