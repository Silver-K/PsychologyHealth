import axios, { AxiosError } from "axios";

function createRequest() {
  axios.interceptors.response.use((response) => response, (error: AxiosError<{ success: false, message: string, data: any }>) => {
    if (error.response && error.response.data && error.response.data.message) {
      if (error.response.data.message === 'old password is error') {
        error.response.data.message = '旧密码错误';
      }
      if (['invalid password', 'password is error'].includes(error.response.data.message)) {
        error.response.data.message = '密码错误';
      }
    }
    return error.response;
  });
  return axios;
}

export default createRequest();