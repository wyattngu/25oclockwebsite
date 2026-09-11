/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gộp "www.25oclockhome.com" về domain gốc "25oclockhome.com" (đã là domain canonical
  // khai báo ở app/layout.tsx metadataBase) — trước đây cả 2 domain cùng phục vụ web độc
  // lập, không domain nào redirect sang domain kia. Hậu quả: cookie ghi nhớ ngôn ngữ đã
  // chọn (25oc_locale, set ở app/api/locale/route.ts) là cookie "host-only" (không khai
  // báo Domain=) nên KHÔNG được trình duyệt gửi kèm khi khách chuyển qua lại giữa 2 dạng
  // domain (kết quả Google, link chia sẻ, gõ tay có/không "www"...) — khiến popup chọn
  // ngôn ngữ hiện lại dù khách đã chọn rồi ("lúc có lúc không"). Redirect 308 (permanent)
  // ở đây gộp về đúng 1 domain duy nhất, cookie luôn nhất quán.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.25oclockhome.com" }],
        destination: "https://25oclockhome.com/:path*",
        permanent: true,
      },
    ];
  },
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
