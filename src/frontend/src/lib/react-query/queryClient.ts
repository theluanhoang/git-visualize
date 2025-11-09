import { QueryClient } from "@tanstack/react-query";

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1, // Thử lại 1 lần nếu fetch thất bại
        refetchOnWindowFocus: false, // Không tự động fetch lại khi window focus
        staleTime: 1000 * 60 * 5, // Cache "tươi" trong 5 phút
        gcTime: 1000 * 60 * 60 * 24, // Cache tồn tại 24 giờ trước khi bị garbage collect
      },
    },
  });
}
