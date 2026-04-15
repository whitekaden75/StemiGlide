import { Link } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";

export function CancelPage() {
  return (
    <div className="page-stack">
      <section className="split-panel">
        <article className="card">
          <SectionHeading
            eyebrow="Checkout Canceled"
            title="The Stripe checkout was canceled."
            description="No payment was completed. The user can go back to the order page and try again whenever they are ready."
          />

          <p className="error-message">
            Checkout was canceled before payment was completed.
          </p>

          <div className="button-row">
            <Link className="button button-primary" to="/contact">
              Return to Order Form
            </Link>
            <Link className="button button-secondary" to="/">
              Back Home
            </Link>
          </div>
        </article>

        <article className="card accent-card">
          <h3>Recommended behavior</h3>
          <div className="detail-list">
            <p>Keep the original order in a pending or canceled state.</p>
            <p>Let the user restart checkout without re-entering every detail later if you want to improve the flow.</p>
            <p>Do not mark the order as paid unless Stripe confirms it through a webhook.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
