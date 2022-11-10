import { AxiosInstance } from 'axios';
import { ExpiringStore } from './expiring-store';

/** Decorator to make an axios instance use the cache */
export const withCache = (axios: AxiosInstance, cache: ExpiringStore) => {
  const request = axios.request.bind(axios);

  axios.request = (config) => {
    const key = JSON.stringify(config);
    const result = cache.get(key, () => request(config));

    return result;
  };

  axios.get = (url, config) => axios.request({ ...config, url, method: 'get' });

  return axios;
};
