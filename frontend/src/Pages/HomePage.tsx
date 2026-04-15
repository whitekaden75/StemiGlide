import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  heroStats,
  imageCards,
  productOptions,
  productOverview,
} from "../data/siteContent";
import { SectionHeading } from "../components/SectionHeading";
import { fetchJson } from "../lib/api";
import type {
  ApiCollectionResponse,
  ItemPriceCollectionResponse,
  Testimonial,
} from "../types/models";

export function HomePage() {
  const [testimonialItems, setTestimonialItems] = useState<Testimonial[]>([]);
  const [testimonialError, setTestimonialError] = useState("");
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [visibleTestimonialsCount, setVisibleTestimonialsCount] = useState(1);
  const [carouselResetKey, setCarouselResetKey] = useState(0);
  const [activeHeroImageIndex, setActiveHeroImageIndex] = useState(0);
  const [itemPrices, setItemPrices] = useState<Record<string, number>>(
    Object.fromEntries(
      productOptions.map((productOption) => [
        productOption.name,
        productOption.defaultPrice,
      ])
    )
  );

  useEffect(() => {
    let cancelled = false;

    async function loadHomePageData() {
      try {
        // Home page reviews and price badges are loaded from the backend so
        // approved testimonials and admin-set prices can change without a new deploy.
        const [testimonialResponse, itemPriceResponse] = await Promise.all([
          fetchJson<ApiCollectionResponse<Testimonial>>("/api/testimonials"),
          fetchJson<ItemPriceCollectionResponse>("/api/inquiries/item-prices"),
        ]);

        if (!cancelled) {
          setTestimonialItems(testimonialResponse.data);
          setItemPrices(
            itemPriceResponse.data.reduce<Record<string, number>>(
              (priceMap, itemPrice) => {
                priceMap[itemPrice.productName] = Number(itemPrice.itemPrice);
                return priceMap;
              },
              Object.fromEntries(
                productOptions.map((productOption) => [
                  productOption.name,
                  productOption.defaultPrice,
                ])
              )
            )
          );
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

    void loadHomePageData();

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

  useEffect(() => {
    if (imageCards.length <= 1) {
      return;
    }

    // Rotate through the product photos in the hero card so visitors can
    // see each view without leaving the home page.
    const intervalId = window.setInterval(() => {
      setActiveHeroImageIndex((currentIndex) =>
        currentIndex + 1 >= imageCards.length ? 0 : currentIndex + 1
      );
    }, 3200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
  const activeHeroImage = imageCards[activeHeroImageIndex] ?? imageCards[0];

  function handleTestimonialPageChange(index: number) {
    setActiveTestimonialIndex(index * visibleTestimonialsCount);
    setCarouselResetKey((currentValue) => currentValue + 1);
  }

  return (
    <div className="page-stack">
      <section className="reviews-banner card">
        <div className="reviews-banner-copy">
          <p className="eyebrow">Product Details</p>
          <h2>See how StemiGlide is built for faster field setup.</h2>
          <p className="section-description">
            View the product details page to understand the cable-management
            problem, the design approach, and the workflow benefits for EMS
            crews.
          </p>
        </div>
        <div className="reviews-banner-action">
          <Link className="button button-primary" to="/details">
            View Product Details
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
          <br />
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
          <div className="product-badge">
            6 Lead: ${(itemPrices["6 Lead StemiGlide"] ?? 39).toFixed(2)} | 4
            Lead: ${(itemPrices["4 Lead StemiGlide"] ?? 29).toFixed(2)}
          </div>
          <div className="render-card">
            <img
              key={activeHeroImage.image}
              className="hero-rotating-image"
              src={activeHeroImage.image}
              alt={activeHeroImage.title}
            />
          </div>
          <Link className="button button-primary hero-buy-button" to="/contact">
            Buy Now
          </Link>
        </div>
      </section>

      <section className="split-panel">
        <article className="card accent-card">
          <SectionHeading
            eyebrow="Why It Exists"
            title="Tangled EKG leads create avoidable delays in emergency care."
            description="EMS crews work in fast, high-pressure environments where rapid cardiac monitoring matters. When EKG cables are stored as a twisted bundle, setup becomes slower, organization becomes harder, and repeated tangling can shorten cable life through unnecessary strain and wear."
          />
        </article>

        <article className="card">
          <SectionHeading
            eyebrow="Built For The Field"
            title="StemiGlide is designed to keep leads separated, organized, and ready for use."
            description="By giving each EKG lead a controlled position during storage and transport, StemiGlide reduces tangling, speeds deployment, and helps EMS providers move from retrieval to patient application with less wasted time."
          />
          <div className="detail-list">
            <p>
              Faster access to organized leads during urgent patient assessment
            </p>
            <p>
              Cleaner storage inside EMS bags, drawers, and equipment
              compartments
            </p>
            <p>Less cable twisting, bending, and wear over repeated use</p>
            <p>More reliable setup for crews who need speed and consistency</p>
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
