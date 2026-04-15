import { useState } from "react";
import { Link } from "react-router-dom";
import { demoSteps } from "../data/siteContent";
import { SectionHeading } from "../components/SectionHeading";

export function DemoPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="page-stack">
      <section className="card">
        <SectionHeading
          eyebrow="How It Works"
          title="A simple EMT workflow demo"
          description="This page mirrors the assignment requirement for a step-by-step explanation of how the organizer would be used in a real field situation."
        />

        <div className="timeline">
          {demoSteps.map((step) => (
            <article className="timeline-step" key={step.stepNumber}>
              <div className="timeline-marker">0{step.stepNumber}</div>
              <div className="timeline-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="split-panel">
        <article className="card demo-visual-card">
          <h3>From An EMT To You</h3>

          <div className="video-container">
            {!isVideoOpen ? (
              <button
                type="button"
                className="video-thumbnail"
                onClick={() => setIsVideoOpen(true)}
                aria-label="Play introduction video">
                <img
                  src="/DadIntroThumbnail.png"
                  alt="Preview of EMT introduction video"
                />
                <span className="play-button">▶</span>
              </button>
            ) : (
              <video controls autoPlay playsInline>
                <source src="/DadIntro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <p>
            Built for the realities of the field — keeping ECG leads organized,
            protected, and ready for use.
          </p>
        </article>
      </section>

      <section className="button-row">
        <Link className="button button-secondary" to="/details">
          Back To Details
        </Link>
        <Link className="button button-primary" to="/contact">
          Order
        </Link>
      </section>
    </div>
  );
}
