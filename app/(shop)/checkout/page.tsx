"use client";

/**
 * LƯU Ý: Đây là trang checkout mô phỏng để demo chạy được end-to-end mà không cần
 * kết nối Shopify thật. Khi tích hợp Shopify Storefront API (mục 6.6), thay flow này
 * bằng redirect sang Shopify Checkout (hosted): `window.location.href = cart.checkoutUrl`.
 *
 * Chuyển khoản VietQR: mã QR được tạo động từ tài khoản khai báo ở lib/data/company.ts
 * (bankAccount) — khách quét, chuyển, chủ shop tự đối chiếu sao kê rồi xác nhận đơn.
 * Muốn tự động hoá (server tự nhận biết đã có tiền vào) thì cần nối thêm dịch vụ
 * webhook ngân hàng như SePay/Casso, hoặc một cổng thanh toán (VNPay/MoMo/ZaloPay).
 *
 * Mỗi đơn hoàn tất được gửi tới app/api/orders/route.ts để báo email về
 * company.orderNotificationEmail (qua Resend) — xem .env.local.example để bật.
 */

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/store/cart-context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { buildVietQrUrl, isBankAccountConfigured } from "@/lib/utils/vietqr";
import { isValidVietnamesePhone, normalizePhone } from "@/lib/utils/phone";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Placeholder } from "@/components/ui/Placeholder";
import { company } from "@/lib/data/company";
import { provinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from "@/lib/data/vietnamLocations";
import type { CartLine, OrderPayload } from "@/lib/types";

// Chỉ còn 1 phương thức — chuyển khoản qua VietQR (đã bỏ COD).
const PAYMENT_LABEL = "Chuyển khoản ngân hàng (VietQR)";

type OrderSummary = {
  lines: CartLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentLabel: string;
};

type Step = { name: "form" } | ({ name: "done"; orderId: string } & OrderSummary);

function makeOrderId(): string {
  // ID này là primary key khi lưu đơn vào database — ghép timestamp (base36) +
  // 3 ký tự ngẫu nhiên để tránh trùng nếu 2 đơn được tạo cùng lúc.
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `25OC${ts}${rand}`;
}

const EMPTY_CUSTOMER = { name: "", phone: "", email: "", address: "", city: "", district: "", ward: "", note: "" };

export default function CheckoutPage() {
  const { lines, subtotalAmount, clearCart } = useCart();
  const [step, setStep] = useState<Step>({ name: "form" });
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const districts = useMemo(() => getDistrictsByProvinceCode(provinceCode), [provinceCode]);
  const wards = useMemo(() => getWardsByDistrictCode(provinceCode, districtCode), [provinceCode, districtCode]);

  // Nếu khách đang đăng nhập, lấy sẵn email tài khoản — vừa để điền sẵn, vừa để đối
  // chiếu email nhập ở form có khớp không (đơn phải cùng email mới nối được vào lịch
  // sử tài khoản ở /account).
  useEffect(() => {
    fetch("/api/account/me")
      .then((res) => res.json())
      .then((data: { customer: { email: string; name: string } | null }) => {
        if (!data.customer) return;
        setLoggedInEmail(data.customer.email);
        setCustomer((prev) => (prev.email ? prev : { ...prev, email: data.customer!.email }));
      })
      .catch(() => {});
  }, []);

  const shippingFee = subtotalAmount >= company.freeShippingThreshold || subtotalAmount === 0 ? 0 : 30000;
  const total = subtotalAmount + shippingFee;

  function updateField(field: keyof typeof customer, value: string) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }

  function handleProvinceChange(code: string) {
    const numeric = code ? Number(code) : null;
    setProvinceCode(numeric);
    setDistrictCode(null); // đổi tỉnh thì reset quận/huyện + phường/xã đã chọn
    const province = provinces.find((p) => p.code === numeric);
    setCustomer((prev) => ({ ...prev, city: province?.name ?? "", district: "", ward: "" }));
  }

  function handleDistrictChange(code: string) {
    const numeric = code ? Number(code) : null;
    setDistrictCode(numeric);
    const district = districts.find((d) => d.code === numeric);
    setCustomer((prev) => ({ ...prev, district: district?.name ?? "", ward: "" })); // đổi quận/huyện thì reset phường/xã đã chọn
  }

  function handleWardChange(code: string) {
    const ward = wards.find((w) => w.code === Number(code));
    updateField("ward", ward?.name ?? "");
  }

  /** Gửi đơn về app/api/orders — không chặn luồng đặt hàng nếu gửi email thất bại. */
  function notifyOrder(orderId: string, paymentLabel: string) {
    const payload: OrderPayload = {
      orderId,
      paymentMethod: paymentLabel,
      customer: { ...customer, phone: normalizePhone(customer.phone) },
      lines: lines.map((l) => ({ title: l.title, size: l.size, quantity: l.quantity, price: l.price })),
      subtotal: { amount: subtotalAmount, currencyCode: "VND" },
      shippingFee: { amount: shippingFee, currencyCode: "VND" },
      total: { amount: total, currencyCode: "VND" },
    };
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn("[checkout] Không gửi được email báo đơn hàng:", err));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidVietnamesePhone(customer.phone)) {
      setPhoneError("Số điện thoại không đúng định dạng di động Việt Nam (VD: 0912 345 678).");
      return;
    }
    setPhoneError(null);
    if (loggedInEmail && customer.email.trim().toLowerCase() !== loggedInEmail.toLowerCase()) {
      setEmailError(`Email phải trùng với email tài khoản đang đăng nhập (${loggedInEmail}) để đơn hiện đúng trong "Tài khoản".`);
      return;
    }
    setEmailError(null);
    const orderId = makeOrderId();
    notifyOrder(orderId, PAYMENT_LABEL);
    // Chụp lại giỏ hàng trước khi clearCart() xoá sạch — bước xác nhận cần hiện
    // lại đúng những gì vừa đặt. Đơn được ghi nhận ngay — không còn nút "Tôi đã
    // chuyển khoản": khách chụp mã đơn gửi qua Instagram rồi thanh toán/xác nhận ở đó.
    setStep({ name: "done", orderId, lines, subtotal: subtotalAmount, shippingFee, total, paymentLabel: PAYMENT_LABEL });
    clearCart();
  }

  if (step.name === "done") {
    const qrUrl = buildVietQrUrl(step.total, step.orderId);
    return (
      <div className="container-25 flex flex-col items-center gap-5 py-16 text-center">
        <h1 className="text-[22px] font-medium uppercase tracking-[0.06em]">Đặt hàng thành công</h1>
        <p className="text-[14px] text-ink-60">
          Mã đơn hàng <strong className="text-ink">#{step.orderId}</strong>
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR động từ VietQR.io, không cần tối ưu qua next/image */}
        <img
          src={qrUrl}
          alt={`Mã VietQR chuyển khoản ${formatPrice({ amount: step.total, currencyCode: "VND" })}`}
          width={300}
          height={430}
          className="border border-line"
        />

        <div className="text-[14px]">
          <p>
            Số tiền: <strong>{formatPrice({ amount: step.total, currencyCode: "VND" })}</strong>
          </p>
          <p>
            Nội dung chuyển khoản: <strong>{step.orderId}</strong>
          </p>
          <p className="mt-2 text-ink-60">
            {company.bankAccount.accountName} — {company.bankAccount.bankId.toUpperCase()} —{" "}
            {company.bankAccount.accountNumber}
          </p>
        </div>

        {!isBankAccountConfigured() ? (
          <p className="max-w-sm text-[12px] text-sale">
            Đây là số tài khoản mẫu, chưa phải tài khoản thật — sửa trong{" "}
            <code className="text-[11px]">lib/data/company.ts</code> (bankAccount) để hiện đúng tài khoản nhận tiền
            của bạn.
          </p>
        ) : null}

        <div className="w-full max-w-sm border border-ink px-4 py-3 text-left text-[14px]">
          <p className="font-medium">Bước tiếp theo</p>
          <p className="mt-1.5 text-[13px] leading-snug text-ink-60">
            Chụp lại màn hình trang này (có mã đơn <strong className="text-ink">#{step.orderId}</strong>) và gửi qua
            Instagram cho shop để thanh toán/xác nhận đơn.
          </p>
          <a
            href={company.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-[13px] text-ink underline underline-offset-2"
          >
            {company.instagram.label}
          </a>
        </div>

        <div className="mt-4 w-full max-w-md border border-line text-left">
          <div className="divide-y divide-line">
            {step.lines.map((line) => (
              <div key={line.lineId} className="flex gap-3 p-4">
                <div className="w-14 shrink-0">
                  <Placeholder tone={line.image.tone} ratio="3 / 4" />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-[13px] font-medium uppercase tracking-wide">{line.title}</p>
                  <p className="mt-0.5 text-[12px] text-ink-60">
                    Size {line.size} · SL {line.quantity}
                  </p>
                </div>
                <p className="self-center text-[13px] tabular-nums">
                  {formatPrice({ amount: line.price.amount * line.quantity, currencyCode: "VND" })}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-line p-4 text-[13px]">
            <div className="flex justify-between text-ink-60">
              <span>Tạm tính</span>
              <span className="tabular-nums">{formatPrice({ amount: step.subtotal, currencyCode: "VND" })}</span>
            </div>
            <div className="flex justify-between text-ink-60">
              <span>Vận chuyển</span>
              <span className="tabular-nums">
                {step.shippingFee === 0 ? "Miễn phí" : formatPrice({ amount: step.shippingFee, currencyCode: "VND" })}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-[14px] font-medium">
              <span>Tổng cộng</span>
              <span className="tabular-nums">{formatPrice({ amount: step.total, currencyCode: "VND" })}</span>
            </div>
            <div className="flex justify-between pt-1 text-ink-60">
              <span>Thanh toán</span>
              <span>{step.paymentLabel}</span>
            </div>
          </div>
        </div>

        <LinkButton href="/collections/all" className="mt-4">
          Tiếp tục mua sắm
        </LinkButton>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-25 flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-[15px] text-ink-60">Giỏ hàng đang trống, không có gì để thanh toán.</p>
        <LinkButton href="/collections/all">Quay lại mua sắm</LinkButton>
      </div>
    );
  }

  return (
    <div className="container-25 py-8 md:py-12">
      <h1 className="mb-8 text-center text-[22px] font-medium uppercase tracking-[0.06em] md:text-[28px]">
        Thanh toán
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section>
            <h2 className="nav-link mb-4">Thông tin giao hàng</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                required
                placeholder="Họ và tên"
                value={customer.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <div>
                <Input
                  required
                  type="tel"
                  placeholder="Số điện thoại"
                  value={customer.phone}
                  onChange={(e) => {
                    updateField("phone", e.target.value);
                    if (phoneError) setPhoneError(null); // xoá lỗi ngay khi khách sửa lại
                  }}
                  aria-invalid={phoneError ? true : undefined}
                  className={phoneError ? "border-sale" : undefined}
                />
                {phoneError ? <p className="mt-1 text-[12px] text-sale">{phoneError}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <Input
                  required
                  type="email"
                  placeholder="Email"
                  value={customer.email}
                  onChange={(e) => {
                    updateField("email", e.target.value);
                    if (emailError) setEmailError(null); // xoá lỗi ngay khi khách sửa lại
                  }}
                  aria-invalid={emailError ? true : undefined}
                  className={emailError ? "border-sale" : undefined}
                />
                {emailError ? (
                  <p className="mt-1 text-[12px] text-sale">
                    {emailError}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        updateField("email", loggedInEmail!);
                        setEmailError(null);
                      }}
                      className="underline underline-offset-2"
                    >
                      Dùng email tài khoản
                    </button>
                  </p>
                ) : loggedInEmail ? (
                  <p className="mt-1 text-[12px] text-ink-60">Đang dùng email tài khoản: {loggedInEmail}</p>
                ) : null}
              </div>
              <Input
                required
                placeholder="Địa chỉ"
                className="sm:col-span-2"
                value={customer.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
              <Select
                required
                value={provinceCode ?? ""}
                onChange={(e) => handleProvinceChange(e.target.value)}
                aria-label="Tỉnh / Thành phố"
              >
                <option value="" disabled>
                  Tỉnh / Thành phố
                </option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Select
                required
                value={districtCode ?? ""}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!provinceCode}
                aria-label="Quận / Huyện"
              >
                <option value="" disabled>
                  {provinceCode ? "Quận / Huyện" : "Chọn tỉnh/thành trước"}
                </option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <Select
                required
                value={wards.find((w) => w.name === customer.ward)?.code ?? ""}
                onChange={(e) => handleWardChange(e.target.value)}
                disabled={!districtCode}
                aria-label="Phường / Xã"
                className="sm:col-span-2"
              >
                <option value="" disabled>
                  {districtCode ? "Phường / Xã" : "Chọn quận/huyện trước"}
                </option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              rows={2}
              placeholder="Ghi chú đơn hàng (tuỳ chọn)"
              className="mt-4"
              value={customer.note}
              onChange={(e) => updateField("note", e.target.value)}
            />
          </section>

          <section>
            <h2 className="nav-link mb-4">Phương thức thanh toán</h2>
            <div className="border border-ink px-4 py-3 text-[14px]">
              <p className="font-medium">{PAYMENT_LABEL}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-ink-60">
                Để hoàn tất đặt hàng, quý khách vui lòng chụp ảnh xác nhận chuyển khoản và gửi qua Instagram để
                shop xác nhận đơn.{" "}
                <a
                  href={company.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2"
                >
                  {company.instagram.label}
                </a>
              </p>
            </div>
          </section>
        </div>

        <div className="h-fit border border-line p-6">
          <h2 className="nav-link mb-4">Đơn hàng ({lines.length})</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {lines.map((line) => (
              <div key={line.lineId} className="flex items-center gap-3">
                <div className="w-14 shrink-0">
                  <Placeholder tone={line.image.tone} ratio="3 / 4" />
                </div>
                <div className="flex-1 text-[13px]">
                  <p className="uppercase">{line.title}</p>
                  <p className="text-ink-60">
                    Size {line.size} × {line.quantity}
                  </p>
                </div>
                <span className="text-[13px] tabular-nums">
                  {formatPrice({ amount: line.price.amount * line.quantity, currencyCode: "VND" })}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span className="tabular-nums">{formatPrice({ amount: subtotalAmount, currencyCode: "VND" })}</span>
            </div>
            <div className="flex justify-between">
              <span>Vận chuyển</span>
              <span className="tabular-nums">{shippingFee === 0 ? "Miễn phí" : formatPrice({ amount: shippingFee, currencyCode: "VND" })}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-[16px] font-medium">
              <span>Tổng cộng</span>
              <span className="tabular-nums">{formatPrice({ amount: total, currencyCode: "VND" })}</span>
            </div>
          </div>

          <Button type="submit" fullWidth className="mt-6">
            Đặt hàng
          </Button>
        </div>
      </form>
    </div>
  );
}
