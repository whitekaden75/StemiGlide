import { fetchJson } from "./api";
import type {
  CheckoutSessionResponse,
  InquiryFormValues,
} from "../types/models";

export async function beginCheckout(formValues: InquiryFormValues) {
  const response = await fetchJson<CheckoutSessionResponse>(
    "/api/inquiries/checkout-session",
    {
      method: "POST",
      body: JSON.stringify(formValues),
    },
  );

  if (!response.data.checkoutUrl) {
    throw new Error("Stripe checkout URL was not returned by the backend.");
  }

  window.location.href = response.data.checkoutUrl;
}
