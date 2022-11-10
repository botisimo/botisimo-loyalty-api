import { AxiosError } from 'axios';

export const normalizeError = (error: AxiosError) => {
  const response = error?.response?.data || error?.response || error;

  const message = hasMessage(response)
    ? response.message
    : hasError(response)
    ? response?.error
    : response
    ? response
    : 'Unknown error';

  return Promise.reject({ error: message });
};

const hasMessage = (input: any): input is { message: string } => {
  return !!input?.message;
};

const hasError = (input: any): input is { error: string } => {
  return !!input?.error;
};
