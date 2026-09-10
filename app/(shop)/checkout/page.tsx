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

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/store/cart-context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { buildVietQrUrl, isBankAccountConfigured } from "@/lib/utils/vietqr";
import { isValidVietnamesePhone, normalizePhone } from "@/lib/utils/phone";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { CartLineThumb } from "@/components/cart/CartLineThumb";
import { IconInstagram } from "@/components/ui/icons";
import { company } from "@/lib/data/company";
import { provinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from "@/lib/data/vietnamLocations";
import type { CartLine, OrderPayload } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { haptic } from "@/lib/utils/haptics";

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

// Mã tỉnh/thành của Hà Nội trong lib/data/vietnamLocations.ts (dữ liệu 63 tỉnh/thành cũ) — dùng
// để tính phí ship nội thành Hà Nội riêng, thấp hơn các tỉnh thành khác (mục company.shippingFeeHanoi).
const HANOI_PROVINCE_CODE = 1;

// Tự lưu tạm thông tin form checkout vào sessionStorage — lỡ khách bấm nhầm Back, rớt
// mạng, hoặc reload giữa chừng thì quay lại vẫn còn nguyên, khỏi gõ lại từ đầu. Dùng
// sessionStorage (không phải localStorage) vì đây là dữ liệu TẠM cho phiên duyệt web
// hiện tại — đóng hẳn tab/trình duyệt thì tự xoá, không lưu thông tin cá nhân mãi mãi.
// Xoá đi ngay sau khi đặt hàng thành công (xem handleSubmit).
const DRAFT_STORAGE_KEY = "25oclock:checkoutDraft";

type CheckoutDraft = {
  customer: typeof EMPTY_CUSTOMER;
  provinceCode: number | null;
  districtCode: number | null;
};

/**
 * Khối thông báo "chụp màn hình gửi Instagram" — dùng chung cho cả lúc điền
 * form (nhắc trước) và sau khi đặt hàng xong (nhắc lại, có mã đơn). Nền đen
 * đặc + icon để thật nổi bật, không dùng màu đỏ (giữ đúng tông đen-trắng của
 * shop, tránh gây cảm giác giống lỗi/cảnh báo).
 */
function InstagramNotice({ heading, message }: { heading: string; message: React.ReactNode }) {
  return (
    <div className="border border-ink bg-ink px-4 py-4 text-white">
      <div className="flex items-center gap-2">
        <IconInstagram className="h-5 w-5 shrink-0" />
        <p className="text-[13px] font-semibold uppercase tracking-wide">{heading}</p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-white/80">{message}</p>
      <a
        href={company.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 bg-white px-4 py-2 text-[12px] font-medium uppercase tracking-wide text-ink transition-colors hover:bg-white/85"
      >
        <IconInstagram className="h-3.5 w-3.5" />
        {company.instagram.label}
      </a>
    </div>
  );
}

export default function CheckoutPage() {
  const { lines, subtotalAmount, clearCart } = useCart();
  const { dict: t } = useLocale();
  const paymentLabel = t.checkout.paymentLabel;
  const [step, setStep] = useState<Step>({ name: "form" });
  // Chặn bấm đúp "Đặt hàng" — bấm nhanh 2 lần trước khi React kịp render lại
  // (đổi sang bước "done", ẩn nút đi) có thể tạo 2 đơn trùng trong Supabase.
  const submittingRef = useRef(false);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);
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

  // Nạp bản nháp form đã lưu (nếu có) khi vừa vào trang.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const draft: CheckoutDraft = JSON.parse(raw);
        setCustomer((prev) => ({ ...prev, ...draft.customer }));
        setProvinceCode(draft.provinceCode);
        setDistrictCode(draft.districtCode);
      }
    } catch {
      // sessionStorage không khả dụng hoặc dữ liệu lưu bị hỏng — bỏ qua, coi như chưa có nháp.
    }
    setDraftHydrated(true);
  }, []);

  // Lưu lại mỗi khi khách gõ/thay đổi gì đó — chỉ bắt đầu lưu SAU khi đã nạp xong bản
  // nháp cũ ở trên, không thì lượt lưu đầu tiên (lúc form còn rỗng) sẽ đè mất bản nháp
  // vừa đọc được trước khi state kịp cập nhật.
  useEffect(() => {
    if (!draftHydrated) return;
    try {
      const draft: CheckoutDraft = { customer, provinceCode, districtCode };
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // bỏ qua nếu storage đầy / bị chặn
    }
  }, [customer, provinceCode, districtCode, draftHydrated]);

  const shippingFee =
    subtotalAmount >= company.freeShippingThreshold || subtotalAmount === 0
      ? 0
      : provinceCode === HANOI_PROVINCE_CODE
        ? company.shippingFeeHanoi
        : company.shippingFeeOtherProvinces;
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

  /**
   * Gửi đơn về app/api/orders — trả về true CHỈ KHI đơn thực sự được lưu vào Supabase
   * ("saved" trong response, xem app/api/orders/route.ts). Email báo shop gửi thất bại
   * KHÔNG tính là lỗi (đơn vẫn coi là thành công) — nhưng lưu DB thất bại thì phải coi
   * là lỗi thật: trước đây hàm này "bắn và quên" (fire-and-forget), khiến khách luôn
   * thấy "Đặt hàng thành công" + mã QR dù đơn có thể CHƯA HỀ được lưu (Supabase lỗi/rớt
   * mạng/chưa cấu hình) — tức khách chuyển khoản cho 1 đơn mà shop không hề biết tới.
   */
  async function notifyOrder(orderId: string, paymentLabel: string): Promise<boolean> {
    const payload: OrderPayload = {
      orderId,
      paymentMethod: paymentLabel,
      // .trim().toLowerCase() ở đây — không thì lỗi khi khách bấm đặt hàng viết hoa/thường
      // khác với email tài khoản (bàn phím điện thoại hay tự viết hoa chữ đầu) sẽ khiến đơn
      // lưu vào DB với chữ hoa/thường khác, còn getOrdersByEmail() so khớp email kiểu chữ
      // thường tuyệt đối (cột "text" thường, không phải "citext") — đơn bị lưu đúng nhưng
      // "biến mất" khỏi trang Tài khoản của chính khách đó vì không khớp được.
      customer: { ...customer, email: customer.email.trim().toLowerCase(), phone: normalizePhone(customer.phone) },
      lines: lines.map((l) => ({ title: l.title, size: l.size, quantity: l.quantity, price: l.price })),
      subtotal: { amount: subtotalAmount, currencyCode: "VND" },
      shippingFee: { amount: shippingFee, currencyCode: "VND" },
      total: { amount: total, currencyCode: "VND" },
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      const data: { ok: boolean; saved?: boolean } = await res.json();
      return data.saved === true;
    } catch (err) {
      console.warn("[checkout] Không gửi được đơn hàng:", err);
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return; // đang xử lý lượt bấm trước — bỏ qua các lần bấm thêm
    if (!isValidVietnamesePhone(customer.phone)) {
      setPhoneError(t.checkout.phoneInvalid);
      return;
    }
    setPhoneError(null);
    if (loggedInEmail && customer.email.trim().toLowerCase() !== loggedInEmail.toLowerCase()) {
      setEmailError(t.checkout.emailMismatch(loggedInEmail));
      return;
    }
    setEmailError(null);
    setSubmitError(null);
    submittingRef.current = true;
    setPlacingOrder(true);
    const orderId = makeOrderId();
    const saved = await notifyOrder(orderId, paymentLabel);
    setPlacingOrder(false);
    if (!saved) {
      // Lưu thất bại thật (không phải chỉ email báo shop) — KHÔNG được coi là thành
      // công: giữ nguyên form + giỏ hàng, để khách bấm thử lại thay vì đưa họ tới bước
      // "đặt hàng thành công" cho 1 đơn chưa hề tồn tại trong hệ thống.
      submittingRef.current = false;
      setSubmitError(t.checkout.orderSaveFailed);
      return;
    }
    haptic("success");
    // Chụp lại giỏ hàng trước khi clearCart() xoá sạch — bước xác nhận cần hiện
    // lại đúng những gì vừa đặt. Đơn được ghi nhận ngay — không còn nút "Tôi đã
    // chuyển khoản": khách chụp mã đơn gửi qua Instagram rồi thanh toán/xác nhận ở đó.
    setStep({ name: "done", orderId, lines, subtotal: subtotalAmount, shippingFee, total, paymentLabel });
    clearCart();
    try {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // bỏ qua nếu storage không khả dụng
    }
  }

  if (step.name === "done") {
    const qrUrl = buildVietQrUrl(step.total, step.orderId);
    return (
      <div className="container-25 flex flex-col items-center gap-5 py-16 text-center">
        <h1 className="text-[22px] font-medium uppercase tracking-[0.06em]">{t.checkout.orderSuccess}</h1>
        <p className="text-[14px] text-ink-60">
          {t.checkout.orderCode} <strong className="text-ink">#{step.orderId}</strong>
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR động từ VietQR.io, không cần tối ưu qua next/image */}
        <img
          src={qrUrl}
          alt={t.checkout.qrAlt(formatPrice({ amount: step.total, currencyCode: "VND" }))}
          width={300}
          height={430}
          className="border border-line"
        />

        <div className="text-[14px]">
          <p>
            {t.checkout.amount}: <strong>{formatPrice({ amount: step.total, currencyCode: "VND" })}</strong>
          </p>
          <p>
            {t.checkout.transferContent}: <strong>{step.orderId}</strong>
          </p>
          <p className="mt-2 text-ink-60">
            {company.bankAccount.accountName} — {company.bankAccount.bankId.toUpperCase()} —{" "}
            {company.bankAccount.accountNumber}
          </p>
        </div>

        {!isBankAccountConfigured() ? (
          <p className="max-w-sm text-[12px] text-sale">{t.checkout.sampleAccountWarning}</p>
        ) : null}

        <div className="w-full max-w-sm">
          <InstagramNotice
            heading={t.checkout.igDoneHeading}
            message={
              <>
                {t.checkout.igDoneMessage} <strong className="text-white">#{step.orderId}</strong>
                {t.checkout.igDoneMessageEnd}
              </>
            }
          />
        </div>

        <div className="mt-4 w-full max-w-md border border-line text-left">
          <div className="divide-y divide-line">
            {step.lines.map((line) => (
              <div key={line.lineId} className="flex gap-3 p-4">
                <div className="w-14 shrink-0">
                  <CartLineThumb photo={line.photo} tone={line.image.tone} alt={line.title} />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-[13px] font-medium uppercase tracking-wide">{line.title}</p>
                  <p className="mt-0.5 text-[12px] text-ink-60">
                    {t.product.size} {line.size} · {t.cart.quantityAbbr} {line.quantity}
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
              <span>{t.cart.subtotal}</span>
              <span className="tabular-nums">{formatPrice({ amount: step.subtotal, currencyCode: "VND" })}</span>
            </div>
            <div className="flex justify-between text-ink-60">
              <span>{t.checkout.shippingFee}</span>
              <span className="tabular-nums">
                {step.shippingFee === 0 ? t.checkout.free : formatPrice({ amount: step.shippingFee, currencyCode: "VND" })}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-[14px] font-medium">
              <span>{t.checkout.total}</span>
              <span className="tabular-nums">{formatPrice({ amount: step.total, currencyCode: "VND" })}</span>
            </div>
            <div className="flex justify-between pt-1 text-ink-60">
              <span>{t.checkout.payment}</span>
              <span>{step.paymentLabel}</span>
            </div>
          </div>
        </div>

        <LinkButton href="/collections/all" className="mt-4">
          {t.common.continueShopping}
        </LinkButton>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-25 flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-[15px] text-ink-60">{t.checkout.emptyCart}</p>
        <LinkButton href="/collections/all">{t.checkout.backToShop}</LinkButton>
      </div>
    );
  }

  return (
    <div className="container-25 py-8 md:py-12">
      <h1 className="mb-8 text-center text-[22px] font-medium uppercase tracking-[0.06em] md:text-[28px]">
        {t.checkout.title}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section>
            <h2 className="nav-link mb-4">{t.checkout.shippingInfo}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                required
                placeholder={t.checkout.fullName}
                value={customer.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <div>
                <Input
                  required
                  type="tel"
                  placeholder={t.checkout.phone}
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
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={t.checkout.email}
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
                      {t.checkout.useAccountEmail}
                    </button>
                  </p>
                ) : loggedInEmail ? (
                  <p className="mt-1 text-[12px] text-ink-60">{t.checkout.usingAccountEmail(loggedInEmail)}</p>
                ) : null}
              </div>
              <Input
                required
                placeholder={t.checkout.address}
                className="sm:col-span-2"
                value={customer.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
              <Select
                required
                value={provinceCode ?? ""}
                onChange={(e) => handleProvinceChange(e.target.value)}
                aria-label={t.checkout.province}
              >
                <option value="" disabled>
                  {t.checkout.province}
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
                aria-label={t.checkout.district}
              >
                <option value="" disabled>
                  {provinceCode ? t.checkout.district : t.checkout.chooseProvinceFirst}
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
                aria-label={t.checkout.ward}
                className="sm:col-span-2"
              >
                <option value="" disabled>
                  {districtCode ? t.checkout.ward : t.checkout.chooseDistrictFirst}
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
              placeholder={t.checkout.note}
              className="mt-4"
              value={customer.note}
              onChange={(e) => updateField("note", e.target.value)}
            />
          </section>

          <section>
            <h2 className="nav-link mb-4">{t.checkout.paymentMethod}</h2>
            <div className="border border-ink px-4 py-3 text-[14px]">
              <p className="font-medium">{paymentLabel}</p>
            </div>
            <div className="mt-3">
              <InstagramNotice heading={t.checkout.igNoticeHeading} message={t.checkout.igNoticeMessage} />
            </div>
          </section>
        </div>

        <div className="h-fit border border-line p-6">
          <h2 className="nav-link mb-4">{t.checkout.orderTitle(lines.length)}</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {lines.map((line) => (
              <div key={line.lineId} className="flex items-center gap-3">
                <div className="w-14 shrink-0">
                  <CartLineThumb photo={line.photo} tone={line.image.tone} alt={line.title} />
                </div>
                <div className="flex-1 text-[13px]">
                  <p className="uppercase">{line.title}</p>
                  <p className="text-ink-60">
                    {t.product.size} {line.size} × {line.quantity}
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
              <span>{t.cart.subtotal}</span>
              <span className="tabular-nums">{formatPrice({ amount: subtotalAmount, currencyCode: "VND" })}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.checkout.shippingFee}</span>
              <span className="tabular-nums">{shippingFee === 0 ? t.checkout.free : formatPrice({ amount: shippingFee, currencyCode: "VND" })}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-[16px] font-medium">
              <span>{t.checkout.total}</span>
              <span className="tabular-nums">{formatPrice({ amount: total, currencyCode: "VND" })}</span>
            </div>
          </div>

          {submitError ? <p className="mt-4 text-[13px] text-sale">{submitError}</p> : null}

          <Button type="submit" fullWidth className="mt-6" disabled={placingOrder}>
            {placingOrder ? t.checkout.placingOrder : t.checkout.placeOrder}
          </Button>
        </div>
      </form>
    </div>
  );
}
