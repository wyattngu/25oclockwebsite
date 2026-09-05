/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cho phép next/image tối ưu ảnh cục bộ trong public/images/** kèm query string
    // "?v=<mốc thời gian sửa file>" — dùng để phá cache trình duyệt khi ảnh được thay
    // mới nhưng giữ nguyên tên file (ví dụ hero-desktop.jpg, tops.jpg — xem
    // lib/utils/heroImage.ts, lib/utils/collectionImages.ts). Không khai báo "search"
    // nghĩa là chấp nhận mọi giá trị "?v=...".
    localPatterns: [
      {
        pathname: "/images/**",
      },
    ],
    // remotePatterns dưới đây chỉ để sẵn cho khi nối Shopify CDN thật.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;
