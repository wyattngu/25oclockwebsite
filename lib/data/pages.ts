import { company } from "@/lib/data/company";
import { formatPrice } from "@/lib/utils/formatPrice";

export type StaticPage = {
  slug: string;
  title: string;
  intro?: string;
  sections: { heading: string; paragraphs: string[]; list?: string[] }[];
};

// Dùng chung đúng 1 nguồn (company.freeShippingThreshold) cho mọi chỗ nhắc tới
// mốc miễn phí ship — đổi ở lib/data/company.ts là tự cập nhật khắp nơi, không
// còn cảnh sửa 1 chỗ mà chỗ khác vẫn ghi số cũ.
const freeShippingLine = `Miễn phí vận chuyển cho đơn hàng từ ${formatPrice({ amount: company.freeShippingThreshold, currencyCode: "VND" })}.`;
const freeShippingLineEn = `Free shipping on orders over ${formatPrice({ amount: company.freeShippingThreshold, currencyCode: "VND" })}.`;

export const staticPages: StaticPage[] = [
  {
  slug: "about",
title: "Về 25 O'CLOCK",
intro:
  "25 o'clock là giờ không có trên đồng hồ — khoảng thời gian bạn dành cho riêng mình.",
sections: [
  {
    heading: "Câu chuyện",
    paragraphs: [
      "25 o'clock bắt đầu năm 2025 tại Hà Nội, từ một người thích quần áo và muốn chia sẻ điều đó bằng sản phẩm thay vì bằng lời nói.",
      "Denim là thứ 25 o'clock chọn làm chất liệu chính và đại diện cho brand. Mỗi đợt sản phẩm đều có một số lượng nhất định để có thể kiểm soát được chất lượng tốt nhất trước khi đến tay khách hàng.",
    ],
  },
],
  },
  {
    slug: "size-guide",
    title: "Hướng dẫn chọn size",
    intro: "Số đo dưới đây là số đo trung bình theo từng loại sản phẩm. Mỗi trang sản phẩm có bảng số đo riêng, chính xác theo form dáng của sản phẩm đó.",
    sections: [
      {
        heading: "Cách đo",
        paragraphs: ["Dùng thước dây, đo trên cơ thể hoặc trên sản phẩm đang có sẵn vừa vặn với bạn."],
        list: [
          "Vòng ngực: đo quanh phần rộng nhất của ngực, thước dây song song mặt đất.",
          "Vòng eo: đo quanh phần eo nhỏ nhất.",
          "Vòng mông/hông: đo quanh phần rộng nhất của mông.",
          "Dài áo/dài quần: đo từ điểm cao nhất của vai/cạp xuống điểm kết thúc mong muốn.",
        ],
      },
      {
        heading: "Nếu phân vân giữa 2 size",
        paragraphs: [
          "Với áo form Regular hoặc Slim: nên chọn size lớn hơn nếu thích mặc rộng rãi.",
          "Với áo form Oversized: sản phẩm đã được thiết kế rộng sẵn, có thể giữ nguyên size theo số đo ngực.",
          "Với quần denim: số size là vòng eo tính bằng inch (VD: size 30 = vòng eo ~76cm).",
        ],
      },
    ],
  },
  {
    slug: "shipping-returns",
    title: "Vận chuyển & đổi trả",
    sections: [
      {
        heading: "Vận chuyển nội địa",
        paragraphs: ["Đơn hàng được xử lý trong vòng 24 giờ làm việc kể từ khi xác nhận thanh toán."],
        list: [
          "Nội thành Hà Nội: 1–2 ngày làm việc.",
          "Các tỉnh thành khác: 2–4 ngày làm việc.",
          freeShippingLine,
        ],
      },
      {
        heading: "Vận chuyển quốc tế",
        paragraphs: [
          "Đối với các đơn hàng quốc tế vui lòng liên hệ qua trang instagram của 25 O'CLOCK để được tư vấn cũng như hỗ trợ một cách chi tiết.",
        ],
      },
      {
        heading: "Đổi trả",
        paragraphs: [`Chấp nhận đổi size hoặc trả hàng trong vòng ${company.returnWindowDays} ngày kể từ khi nhận hàng.`],
        list: [
          "Sản phẩm còn nguyên tem, chưa qua sử dụng hoặc giặt.",
          "Chi phí vận chuyển đổi trả do khách hàng chi trả, trừ trường hợp lỗi từ nhà sản xuất.",
        ],
      },
    ],
  },
];

// Bản tiếng Anh song song — cùng "slug", cùng thứ tự section, dùng khi khách chọn
// English (xem app/(shop)/pages/[slug]/page.tsx). Không tự sinh máy — dịch tay để
// giữ đúng giọng văn thương hiệu.
export const staticPagesEn: StaticPage[] = [
  {
    slug: "about",
    title: "About 25 O'CLOCK",
    intro: "25 o'clock is the hour that doesn't exist on a clock — the time you keep just for yourself.",
    sections: [
      {
        heading: "Our Story",
        paragraphs: [
          "25 o'clock started in 2025 in Hanoi, from someone who loved clothes and wanted to share that through product rather than words.",
          "Denim is the material 25 o'clock chose as its core and its signature. Every drop is made in a limited quantity so we can control quality as closely as possible before it reaches you.",
        ],
      },
    ],
  },
  {
    slug: "size-guide",
    title: "Size Guide",
    intro:
      "The measurements below are average figures per product type. Each product page has its own measurement chart, accurate to that item's specific fit.",
    sections: [
      {
        heading: "How to measure",
        paragraphs: ["Use a measuring tape, on your body or on a piece you already own that fits you well."],
        list: [
          "Chest: measure around the fullest part of your chest, tape parallel to the ground.",
          "Waist: measure around your natural waistline.",
          "Hip: measure around the fullest part of your hips.",
          "Garment/inseam length: measure from the highest point of the shoulder/waistband down to your desired endpoint.",
        ],
      },
      {
        heading: "If you're between two sizes",
        paragraphs: [
          "For Regular or Slim fit tops: size up if you prefer a roomier fit.",
          "For Oversized fit tops: the piece is already cut roomy, so you can usually stick with your regular chest measurement.",
          "For denim: the size number is the waist measurement in inches (e.g. size 30 = ~76cm waist).",
        ],
      },
    ],
  },
  {
    slug: "shipping-returns",
    title: "Shipping & Returns",
    sections: [
      {
        heading: "Domestic shipping",
        paragraphs: ["Orders are processed within 24 business hours of payment confirmation."],
        list: ["Inner Hanoi: 1–2 business days.", "Other provinces: 2–4 business days.", freeShippingLineEn],
      },
      {
        heading: "International shipping",
        paragraphs: ["For international orders, please reach out via 25 O'CLOCK's Instagram for detailed support."],
      },
      {
        heading: "Returns & exchanges",
        paragraphs: [`We accept size exchanges or returns within ${company.returnWindowDays} days of delivery.`],
        list: [
          "Item must have tags attached, unused and unwashed.",
          "Return shipping cost is covered by the customer, except in cases of a manufacturing defect.",
        ],
      },
    ],
  },
];

export function getStaticPage(slug: string, locale: "vi" | "en" = "vi"): StaticPage | undefined {
  const source = locale === "en" ? staticPagesEn : staticPages;
  return source.find((p) => p.slug === slug);
}
