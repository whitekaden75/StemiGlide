import { Link } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";

export function SuccessPage() {
  return (
    <div className="page-stack">
      <section className="split-panel">
        <article className="card">
          <SectionHeading
            eyebrow="Order Complete"
            title="Your checkout was successful."
            description="Stripe finished the payment step. If your backend webhook is set up, this is where the order status should move from pending to paid."
          />

          <p className="success-message">
            Payment completed successfully. You can return home or place another order.
          </p>

          <div className="button-row">
            <Link className="button button-primary" to="/">
              Back Home
            </Link>
            <Link className="button button-secondary" to="/contact">
              Order Again
            </Link>
          </div>
        </article>

        <article className="card accent-card">
          <h3>Next backend step</h3>
          <div className="detail-list">
            <p>Listen for Stripe checkout completion in your webhook endpoint.</p>
            <p>Match the Stripe session back to your local order record.</p>
            <p>Update the order status to something like Paid or Submitted.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
