export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export function ok<T>(message: string, data?: T): ApiResponse<T> {
  return data === undefined ? { success: true, message } : { success: true, message, data };
}

export function fail(message: string): ApiResponse<null> {
  return { success: false, message };
}

