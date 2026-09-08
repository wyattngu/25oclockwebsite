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

export function getStaticPage(slug: string): StaticPage | undefined {
  return staticPages.find((p) => p.slug === slug);
}
