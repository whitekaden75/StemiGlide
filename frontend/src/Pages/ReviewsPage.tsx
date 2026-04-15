import { type ChangeEvent, type FormEvent, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { fetchJson } from "../lib/api";
import type { ReviewFormValues, TestimonialResponse } from "../types/models";

const initialReviewValues: ReviewFormValues = {
  name: "",
  email: "",
  organization: "",
  rating: "5",
  review: "",
};

function formatName(value: string) {
  // Keeps names presentation-ready while the user types.
  return value
    .split(" ")
    .map((part) => {
      const trimmedPart = part.trim();

      if (trimmedPart.length === 0) {
        return "";
      }

      return (
        trimmedPart.charAt(0).toUpperCase() + trimmedPart.slice(1).toLowerCase()
      );
    })
    .join(" ");
}

export function ReviewsPage() {
  const [formValues, setFormValues] =
    useState<ReviewFormValues>(initialReviewValues);
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    const nextValue = name === "name" ? formatName(value) : value;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmittedMessage("");

    try {
      // Reviews are submitted to the backend first, then shown publicly
      // only after admin approval.
      const response = await fetchJson<TestimonialResponse>("/api/testimonials", {
        method: "POST",
        body: JSON.stringify(formValues),
      });

      setSubmittedMessage(response.message);
      setFormValues(initialReviewValues);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit the review right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="split-panel">
        <article className="card">
          <SectionHeading
            eyebrow="Reviews"
            title="Leave a product review"
            description="This separate page gives customers and field users a dedicated place to submit product feedback."
          />

          <form className="inquiry-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Name
                <input
                  name="name"
                  onChange={handleChange}
                  required
                  value={formValues.name}
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={formValues.email}
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
                Rating
                <select
                  name="rating"
                  onChange={handleChange}
                  value={formValues.rating}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Needs Work</option>
                  <option value="1">1 - Poor</option>
                </select>
              </label>
            </div>

            <label>
              Review
              <textarea
                name="review"
                onChange={handleChange}
                placeholder="Describe how the organizer helped with setup, training, or workflow."
                required
                rows={6}
                value={formValues.review}
              />
            </label>

            <div className="button-row">
              <button className="button button-primary" type="submit">
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>

            {submittedMessage ? (
              <p className="success-message">
                {submittedMessage}
              </p>
            ) : null}

            {submitError ? (
              <p className="error-message">{submitError}</p>
            ) : null}
          </form>
        </article>

        <article className="card accent-card">
          <h3>Good review prompts</h3>
          <div className="detail-list">
            <p>Did the organizer reduce lead tangling?</p>
            <p>Did it make EKG setup feel faster?</p>
            <p>Was it practical for a real field bag or cart?</p>
            <p>Would you recommend it to another EMT crew?</p>
          </div>
        </article>
      </section>
    </div>
  );
}
