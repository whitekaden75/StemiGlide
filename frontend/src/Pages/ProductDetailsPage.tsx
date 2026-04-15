import { Link } from "react-router-dom";
import {
  detailSections,
  imageCards,
  productFeatures,
  productOverview,
  useCases,
} from "../data/siteContent";
import { SectionHeading } from "../components/SectionHeading";

export function ProductDetailsPage() {
  return (
    <div className="page-stack">
      <section className="card">
        <SectionHeading
          eyebrow="Product Details"
          title={`${productOverview.name} is built to simplify EKG setup.`}
          description="This page explains the real workflow problem, the product's approach, and why the tool could be useful to emergency teams."
        />

        <div className="image-grid">
          {imageCards.map((card, index) => (
            <div key={index} className="image-card">
              <div className="image-card-media">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="image-card-copy">
                <h3>{card.title}</h3>
                <p>{card.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="split-panel">
        {detailSections.map((section) => (
          <article className="card" key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <SectionHeading
          eyebrow="Features + Benefits"
          title="What makes the tool practical"
          description="These points are written in a professional, product-focused tone that fits the assignment and target audience."
        />
        <div className="feature-grid">
          {productFeatures.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-panel">
        <article className="card">
          <h3>Good fit for</h3>
          <ul className="check-list">
            {useCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card callout-card">
          <p className="eyebrow">Next Page</p>
          <h3>Show the workflow in motion</h3>
          <p>
            The demo page breaks the process into steps you can later enrich
            with photos, diagrams, or a short embedded video.
          </p>
          <Link className="button button-primary" to="/demo">
            Go To Demo
          </Link>
        </article>
      </section>
    </div>
  );
}
