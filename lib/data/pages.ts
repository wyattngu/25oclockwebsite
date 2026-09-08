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
      "25 o'clock là khung giờ không tồn tại trên mặt đồng hồ — khoảnh khắc giữa ngày cũ và ngày mới, khi thành phố vẫn còn thức.",
    sections: [
      {
        heading: "Câu chuyện",
        paragraphs: [
          "25 o'clock được thành lập năm 2024 tại TP. Hồ Chí Minh, bởi một nhóm nhỏ những người làm sáng tạo tin rằng thời trang tốt không cần quá nhiều chi tiết — chỉ cần đúng chất liệu, đúng form dáng, và đủ bền để mặc qua nhiều mùa.",
          "Chúng tôi tập trung vào denim và da thật — hai chất liệu có 'tuổi thọ cảm xúc' dài nhất trong tủ đồ. Mỗi sản phẩm được sản xuất tại Việt Nam, số lượng giới hạn theo từng đợt để đảm bảo chất lượng kiểm soát được ở từng khâu.",
        ],
      },
      {
        heading: "Triết lý thiết kế",
        paragraphs: [
          "Ảnh dẫn dắt, chữ đứng sau. Không trang trí thừa. Sản phẩm là nhân vật chính — mọi thứ khác trên website chỉ nhằm mục đích giúp bạn nhìn rõ sản phẩm hơn.",
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
          "Đơn hàng quốc tế được xử lý ngay khi có thể, thời gian giao hàng khoảng 5–10 ngày làm việc (không tính Thứ Bảy, Chủ Nhật). Phí vận chuyển và thuế nhập khẩu (nếu có) được hiển thị trực tiếp tại trang instagram của 25 O'CLOCK",
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
