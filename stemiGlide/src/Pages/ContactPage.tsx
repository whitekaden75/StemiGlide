import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import {
  initialInquiryValues,
  productOptions,
  productOverview,
} from "../data/siteContent";
import { fetchJson } from "../lib/api";
import { beginCheckout } from "../lib/checkout";
import type {
  ApiCollectionResponse,
  ItemPriceCollectionResponse,
  InquiryFormValues,
  Testimonial,
} from "../types/models";

export function ContactPage() {
  const [formValues, setFormValues] =
    useState<InquiryFormValues>(initialInquiryValues);
  const [submitError, setSubmitError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [testimonialItems, setTestimonialItems] = useState<Testimonial[]>([]);
  const [testimonialError, setTestimonialError] = useState("");
  const [itemPrices, setItemPrices] = useState<Record<string, number>>(
    Object.fromEntries(
      productOptions.map((product) => [product.name, product.defaultPrice]),
    ),
  );

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    const fieldName = name as keyof InquiryFormValues;

    setFormValues((currentValues) => {
      if (fieldName === "sixLeadQuantity" || fieldName === "fourLeadQuantity") {
        return {
          ...currentValues,
          [fieldName]: Number(value),
        };
      }

      return {
        ...currentValues,
        [fieldName]: value,
      };
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadTestimonials() {
      try {
        // The order page pulls both approved testimonials and the current
        // product prices so the page reflects live backend data.
        const [testimonialResponse, itemPriceResponse] = await Promise.all([
          fetchJson<ApiCollectionResponse<Testimonial>>("/api/testimonials"),
          fetchJson<ItemPriceCollectionResponse>("/api/inquiries/item-prices"),
        ]);

        if (!cancelled) {
          setTestimonialItems(testimonialResponse.data.slice(0, 2));
          setItemPrices((currentPrices) => ({
            ...currentPrices,
            ...Object.fromEntries(
              itemPriceResponse.data.map((itemPrice) => [
                itemPrice.productName,
                Number(itemPrice.itemPrice),
              ]),
            ),
          }));
          setTestimonialError("");
        }
      } catch (error) {
        if (!cancelled) {
          setTestimonialError(
            error instanceof Error
              ? error.message
              : "Unable to load testimonials.",
          );
        }
      }
    }

    void loadTestimonials();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCheckout(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSubmitError("");
    setIsCheckingOut(true);

    try {
      // This sends the selected quantities and customer info to the backend,
      // which creates the order records and then returns a Stripe Checkout URL.
      await beginCheckout(formValues);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to start Stripe Checkout right now.",
      );
      setIsCheckingOut(false);
    }
  }

  const sixLeadPrice = itemPrices["6 Lead StemiGlide"] ?? 39;
  const fourLeadPrice = itemPrices["4 Lead StemiGlide"] ?? 29;
  const totalItems = formValues.sixLeadQuantity + formValues.fourLeadQuantity;
  // The price summary updates live before the user leaves for Stripe.
  const estimatedTotal =
    formValues.sixLeadQuantity * sixLeadPrice +
    formValues.fourLeadQuantity * fourLeadPrice;

  return (
    <div className="page-stack">
      <section className="split-panel">
        <article className="card">
          <SectionHeading
            eyebrow="Contact / Order"
            title="Start a Stripe checkout for your StemiGlide order."
            description="Complete the form, choose a quantity, and the site will create an order record in the backend before sending you to Stripe."
          />

          <div className="admin-order-grid">
            <div className="admin-order-field">
              <span className="admin-field-label">6 Lead Quantity</span>
              <strong>{formValues.sixLeadQuantity}</strong>
            </div>
            <div className="admin-order-field">
              <span className="admin-field-label">4 Lead Quantity</span>
              <strong>{formValues.fourLeadQuantity}</strong>
            </div>
            <div className="admin-order-field">
              <span className="admin-field-label">Total Items</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="admin-order-field">
              <span className="admin-field-label">Estimated Total</span>
              <strong>${estimatedTotal.toFixed(2)}</strong>
            </div>
          </div>

          <form className="inquiry-form" onSubmit={(event) => void handleCheckout(event)}>
            <div className="form-grid">
              <label>
                6 Lead StemiGlide Quantity
                <input
                  min="0"
                  name="sixLeadQuantity"
                  onChange={handleChange}
                  type="number"
                  value={formValues.sixLeadQuantity}
                />
              </label>

              <label>
                4 Lead StemiGlide Quantity
                <input
                  min="0"
                  name="fourLeadQuantity"
                  onChange={handleChange}
                  type="number"
                  value={formValues.fourLeadQuantity}
                />
              </label>

              <label>
                First name
                <input
                  name="firstName"
                  onChange={handleChange}
                  required
                  value={formValues.firstName}
                />
              </label>

              <label>
                Last name
                <input
                  name="lastName"
                  onChange={handleChange}
                  required
                  value={formValues.lastName}
                />
              </label>

              <label className="form-field-wide">
                Email
                <input
                  name="email"
                  onChange={handleChange}
                  required
                  type="email"
                  value={formValues.email}
                />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  onChange={handleChange}
                  value={formValues.phone}
                />
              </label>

              <label>
                Organization
                <input
                  name="organization"
                  onChange={handleChange}
                  value={formValues.organization}
                />
              </label>

              <label>
                Street
                <input
                  name="street"
                  onChange={handleChange}
                  value={formValues.street}
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  onChange={handleChange}
                  value={formValues.city}
                />
              </label>

              <label>
                State
                <input
                  name="state"
                  onChange={handleChange}
                  value={formValues.state}
                />
              </label>

              <label>
                ZIP
                <input
                  name="zip"
                  onChange={handleChange}
                  value={formValues.zip}
                />
              </label>

            </div>

            <div className="button-row">
              <button className="button button-primary" type="submit">
                {isCheckingOut ? "Redirecting..." : "Checkout"}
              </button>
            </div>

            {submitError ? (
              <p className="error-message">{submitError}</p>
            ) : null}
          </form>
        </article>

        <article className="card accent-card">
          <SectionHeading
            eyebrow="Field Feedback"
            title="What users are saying"
            description="Approved testimonials from the live review feed help break up the page and reinforce the product value."
          />

          <div className="detail-list">
            <p>6 Lead StemiGlide: ${sixLeadPrice.toFixed(2)}</p>
            <p>4 Lead StemiGlide: ${fourLeadPrice.toFixed(2)}</p>
            <p>{productOverview.status}</p>
          </div>

          {testimonialError ? (
            <p className="error-message">{testimonialError}</p>
          ) : null}

          {testimonialItems.length > 0 ? (
            <div className="pending-testimonial-list">
              {testimonialItems.map((testimonial) => (
                <article className="testimonial-card" key={testimonial.id}>
                  <span className="rating">{"★".repeat(testimonial.rating)}</span>
                  <p>{testimonial.quote}</p>
                  <span className="meta-line">{testimonial.reviewerName}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No approved testimonials yet.</p>
          )}
        </article>
      </section>
    </div>
  );
}
