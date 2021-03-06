import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { ApiConfig } from '../config/api.config';

export default function api(
    path: string, 
    method: 'get' | 'post' | 'patch' | 'delete',
    body: any | undefined,
    ) {
        return new Promise<ApiResponse>((resolve) => {
        const requestData = { 
                method: method,
                url: path,
                baseURL: ApiConfig.API_URL,
                data: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getToken(),
                },
            };
        axios(requestData)
        .then(res => responseHandler(res, resolve))
        .catch(async err => {
              // handling http 401 error code, no token
              if(err.response.status === 401) {
                const newToken = await refreshToken();
                if(!newToken) {
                    const response: ApiResponse = {
                        status: 'login',
                        data: null,
                    };
                    return resolve(response);
                }

                saveToken(newToken);

                requestData.headers['Authorization'] = getToken();

                return await repeatRequest(requestData, resolve);
                
            }

            const response: ApiResponse = {
                status: 'error',
                data: err,
            };
            resolve(response);
        });
    });
}

export function apiFile(
    path: string, 
    name: string,
    file: File,
    ) {
        return new Promise<ApiResponse>((resolve) => {
            const formData = new FormData();
            formData.append(name, file);
        const requestData: AxiosRequestConfig = { 
                method: 'post',
                url: path,
                baseURL: ApiConfig.API_URL,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': getToken(),
                },
            };
        axios(requestData)
        .then(res => responseHandler(res, resolve))
        .catch(async err => {
              // handling http 401 error code, no token
              if(err.response.status === 401) {
                const newToken = await refreshToken();
                if(!newToken) {
                    const response: ApiResponse = {
                        status: 'login',
                        data: null,
                    };
                    return resolve(response);
                }

                saveToken(newToken);

                requestData.headers['Authorization'] = getToken();

                return await repeatRequest(requestData, resolve);
                
            }

            const response: ApiResponse = {
                status: 'error',
                data: err,
            };
            resolve(response);
        });
    });
}


export interface ApiResponse {
    status: 'ok' | 'error' | 'login';
    data: any;
}

    async function responseHandler(
        res: AxiosResponse<any>,
        resolve: (value?: ApiResponse) => void,
    ){
        if(res.status < 200 || res.status >= 300){  // Http status codes -> server error

          

            const response: ApiResponse = {
                status: 'error',
                data: res.data,
            };
            return resolve(response);
        } 

        let response: ApiResponse;

        if (res.data.status < 0 ) {  // negative status code -> application error
            response = {
                status: 'login',
                data: null,
             };
            } else {
                response = {
                    status: 'ok',
                    data: res.data,
                };
            }
        return resolve(response);
    }


    function getToken(): string {
        const token = localStorage.getItem('api_token');
        return 'Bearer ' + token;
    }

    export function saveToken(token: string) {
        localStorage.setItem('api_token', token);
    }

    function getRefreshToken(): string { 
        const token = localStorage.getItem('api_refresh_token');
        return token + '';
    }

    export function saveRefreshToken(token: string) {
        localStorage.setItem('api_refresh_token', token);
    }

    async function refreshToken(): 
        Promise<string | null> {
            const path = 'auth/user/refresh';
            const data = {
                token: getRefreshToken()
            }

            const refreshTokenRequestData: AxiosRequestConfig = { 
                method: 'post',
                url: path,
                baseURL: ApiConfig.API_URL,
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                },
            };

        const rtr: { data: { token: string | undefined } } = await axios(refreshTokenRequestData);

        if(!rtr.data.token) {
            return null;
        }

        return rtr.data.token;

    }

    async function repeatRequest(requestData: AxiosRequestConfig, resolve: (value?: ApiResponse) => void) {
        axios(requestData)
            .then(res => {
                let response: ApiResponse;
                if(res.status === 401) {
                    response = {
                        status: 'login',
                        data: null,
                    };
                } else { 
                        response = {
                            status: 'ok',
                            data: res.data,
                    };
                }
                return resolve(response);
            
            })
            .catch(err => {
                const response: ApiResponse = {
                    status: 'error',
                    data: err,
                };
                return resolve(response);
            });
        }

