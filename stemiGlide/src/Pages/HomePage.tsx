import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { heroStats, productOverview } from "../data/siteContent";
import { SectionHeading } from "../components/SectionHeading";
import { fetchJson } from "../lib/api";
import type { ApiCollectionResponse, Testimonial } from "../types/models";

export function HomePage() {
  const [testimonialItems, setTestimonialItems] = useState<Testimonial[]>([]);
  const [testimonialError, setTestimonialError] = useState("");
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [visibleTestimonialsCount, setVisibleTestimonialsCount] = useState(1);
  const [carouselResetKey, setCarouselResetKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadTestimonials() {
      try {
        // Home page reviews are loaded from the backend so approved testimonials
        // can change without editing frontend code.
        const response = await fetchJson<ApiCollectionResponse<Testimonial>>(
          "/api/testimonials"
        );

        if (!cancelled) {
          setTestimonialItems(response.data);
          setTestimonialError("");
        }
      } catch (error) {
        if (!cancelled) {
          setTestimonialError(
            error instanceof Error
              ? error.message
              : "Unable to load testimonials."
          );
        }
      }
    }

    void loadTestimonials();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // The carousel shows more cards when there is room on larger screens.
    function updateVisibleTestimonialsCount() {
      if (window.innerWidth >= 1100) {
        setVisibleTestimonialsCount(3);
        return;
      }

      if (window.innerWidth >= 760) {
        setVisibleTestimonialsCount(2);
        return;
      }

      setVisibleTestimonialsCount(1);
    }

    updateVisibleTestimonialsCount();
    window.addEventListener("resize", updateVisibleTestimonialsCount);

    return () => {
      window.removeEventListener("resize", updateVisibleTestimonialsCount);
    };
  }, []);

  useEffect(() => {
    if (testimonialItems.length <= 1) {
      return;
    }

    // Auto-advance the review carousel until the user clicks a pagination dot.
    const intervalId = window.setInterval(() => {
      setActiveTestimonialIndex((currentIndex) =>
        currentIndex + visibleTestimonialsCount >= testimonialItems.length
          ? 0
          : currentIndex + visibleTestimonialsCount
      );
    }, 4500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [testimonialItems, visibleTestimonialsCount, carouselResetKey]);

  const visibleTestimonials = testimonialItems.slice(
    activeTestimonialIndex,
    activeTestimonialIndex + visibleTestimonialsCount
  );
  const testimonialPages = Math.max(
    1,
    Math.ceil(testimonialItems.length / visibleTestimonialsCount)
  );
  const activePageIndex = Math.floor(
    activeTestimonialIndex / visibleTestimonialsCount
  );

  function handleTestimonialPageChange(index: number) {
    setActiveTestimonialIndex(index * visibleTestimonialsCount);
    setCarouselResetKey((currentValue) => currentValue + 1);
  }

  return (
    <div className="page-stack">
      <section className="reviews-banner card">
        <div className="reviews-banner-copy">
          <p className="eyebrow">Reviews</p>
          <h2>Want to leave feedback about StemiGlide?</h2>
          <p className="section-description">
            Use the reviews page to submit product feedback from EMTs, first
            responders, or training teams.
          </p>
        </div>
        <div className="reviews-banner-action">
          <Link className="button button-primary" to="/reviews">
            Go To Reviews
          </Link>
        </div>
      </section>

      <section className="hero-grid">
        <div className="hero-copy card">
          <p className="eyebrow">Emergency Workflow Improvement</p>
          <h1>{productOverview.headline}</h1>
          <p className="hero-summary">{productOverview.summary}</p>

          <div className="button-row">
            <Link className="button button-primary" to="/details">
              Learn More
            </Link>
            <Link className="button button-secondary" to="/demo">
              View Demo
            </Link>
          </div>

          <div className="stats-grid">
            {heroStats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <span className="stat-label">{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-visual card">
          <div className="product-badge">{productOverview.priceLabel}</div>
          <div className="render-card">
            <img src="public/6leadin.png" alt="Stemi" />
          </div>
        </div>
      </section>

      <section className="split-panel">
        <article className="card accent-card">
          <SectionHeading
            eyebrow="Why It Exists"
            title="The project is centered on a real EMT problem."
            description="EKG wires are easy to tangle. In emergency care, that creates friction exactly where crews need speed and clarity."
          />
        </article>

        <article className="card">
          <SectionHeading
            eyebrow="Built For The Field"
            title="Professional enough for a class project and a real product pitch."
            description="The site explains the problem, shows the workflow, and gives departments or buyers a direct way to contact you about pricing and pilot interest."
          />
          <div className="detail-list">
            <p>Clear multi-page product story</p>
            <p>Responsive front end in React + TypeScript</p>
            <p>Backend-ready inquiry and testimonial flow</p>
            <p>PostgreSQL-backed API support</p>
          </div>
        </article>
      </section>

      <section className="card">
        <SectionHeading
          eyebrow="Field Feedback"
          title="Approved testimonials"
          description="This section loads from the backend and only shows live approved testimonials."
        />
        {testimonialError ? (
          <p className="error-message">{testimonialError}</p>
        ) : null}
        {testimonialItems.length > 0 ? (
          <div className="testimonial-spotlight">
            <div
              className="testimonial-cards-row"
              style={{
                gridTemplateColumns: `repeat(${visibleTestimonials.length}, minmax(0, 1fr))`,
              }}>
              {visibleTestimonials.map((testimonial) => (
                <article
                  className="testimonial-card testimonial-card-spotlight"
                  key={testimonial.id}>
                  <span className="rating">
                    {"★".repeat(testimonial.rating)}
                  </span>
                  <p className="testimonial-quote">{testimonial.quote}</p>
                  <span className="meta-line">
                    {testimonial.reviewerName} • Approved{" "}
                    {testimonial.approved ? "Yes" : "No"}
                  </span>
                </article>
              ))}
            </div>

            {testimonialPages > 1 ? (
              <div className="testimonial-dots" aria-label="Testimonial slides">
                {Array.from({ length: testimonialPages }, (_, index) => (
                  <button
                    key={index}
                    aria-label={`Show testimonial page ${index + 1}`}
                    className={
                      index === activePageIndex
                        ? "testimonial-dot testimonial-dot-active"
                        : "testimonial-dot"
                    }
                    onClick={() => handleTestimonialPageChange(index)}
                    type="button"
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="empty-state">No testimonials available yet.</p>
        )}
      </section>
    </div>
  );
}
