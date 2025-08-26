import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const request = useCallback(async (
    url: string,
    options: RequestInit = {},
    apiOptions: UseApiOptions = {}
  ) => {
    const {
      onSuccess,
      onError,
      showSuccessToast = false,
      showErrorToast = true
    } = apiOptions;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000${url}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      if (showSuccessToast && data.message) {
        toast.success(data.message);
      }

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Something went wrong';
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(errorMessage);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading };
};