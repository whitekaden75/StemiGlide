import { type ReactNode, useState } from "react";

type Section = {
  title: string;
  content: ReactNode;
};

const sections: Section[] = [
  {
    title: "D&C 121:29",
    content: (
      <p>
        All thrones and dominions, principalities and powers, shall be revealed
        and set forth upon all who have endured valiantly for the gospel of
        Jesus Christ.
      </p>
    ),
  },
  {
    title: 'Elder Bednar, "All Who Have Endured Valiantly"',
    content: (
      <div className="lesson-content-stack">
        <p>
          Mormon testified that “charity is the pure love of Christ” and “the
          greatest of all” spiritual gifts. Significantly, the word endure is
          used in the scriptures to define and describe charity.
        </p>
        <p>
          For example, “charity … endureth forever,” “suffereth long, … seeketh
          not her own, … beareth all things, … endureth all things.” And, as you
          sisters know well, “charity never faileth.”
        </p>
        <p>
          Mormon also taught that “whoso is found possessed of [the spiritual
          gift of charity] at the last day, it shall be well with him.” Note the
          double meaning of the word <em>of</em> in this verse. We can possess
          charity, but ultimately charity should possess us.
        </p>
      </div>
    ),
  },
  {
    title: "Moroni 7:44–48",
    content: (
      <div className="lesson-content-stack">
        <p>
          <strong>44</strong> If so, his faith and hope is vain, for none is
          acceptable before God, save the meek and lowly in heart; and if a man
          be meek and lowly in heart, and confesses by the power of the Holy
          Ghost that Jesus is the Christ, he must needs have charity; for if he
          have not charity he is nothing; wherefore he must needs have charity.
        </p>
        <p>
          <strong>45</strong> And charity suffereth long, and is kind, and
          envieth not, and is not puffed up, seeketh not her own, is not easily
          provoked, thinketh no evil, and rejoiceth not in iniquity but
          rejoiceth in the truth, beareth all things, believeth all things,
          hopeth all things, endureth all things.
        </p>
        <p>
          <strong>46</strong> Wherefore, my beloved brethren, if ye have not
          charity, ye are nothing, for charity never faileth. Wherefore, cleave
          unto charity, which is the greatest of all, for all things must fail—
        </p>
        <p>
          <strong>47</strong> But charity is the pure love of Christ, and it
          endureth forever; and whoso is found possessed of it at the last day,
          it shall be well with him.
        </p>
        <p>
          <strong>48</strong> Wherefore, my beloved brethren, pray unto the
          Father with all the energy of heart, that ye may be filled with this
          love...
        </p>

        <div className="lesson-callout">
          <p className="lesson-callout-label">
            Discussion Question
          </p>
          <p className="lesson-callout-question">
            How do we become possessed of charity?
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Doctrine and Covenants 93:12–13, 20",
    content: (
      <div className="lesson-content-stack">
        <p>
          <strong>12</strong> And I, John, saw that he received not of the
          fulness at the first, but received grace for grace;
        </p>
        <p>
          <strong>13</strong> And he received not of the fulness at first, but
          continued from grace to grace, until he received a fulness;
        </p>
        <p>
          <strong>20</strong> For if you keep my commandments you shall receive
          of his fulness, and be glorified in me as I am in the Father;
          therefore, I say unto you, you shall receive grace for grace.
        </p>
      </div>
    ),
  },
];

export default function LessonPlanPage() {
  const [openSection, setOpenSection] = useState<number | null>(null);

  return (
    <div className="lesson-page">
      <main className="lesson-main">
        <div className="lesson-shell">
          <section className="lesson-hero">
            <p className="lesson-kicker">
              Lesson Plan
            </p>

            <h1 className="lesson-title">
              Charity, Enduring Valiantly, and Grace for Grace
            </h1>

            <p className="lesson-intro">
              Open each card to read the scripture or quote for the lesson.
            </p>
          </section>

          <div className="lesson-section-list">
            {sections.map((section, index) => {
              const isOpen = openSection === index;

              return (
                <section
                  key={section.title}
                  className="lesson-card">
                  <button
                    onClick={() => setOpenSection(isOpen ? null : index)}
                    className="lesson-card-toggle">
                    <div className="lesson-card-heading">
                      <p className="lesson-card-label">
                        Section {index + 1}
                      </p>
                      <h2 className="lesson-card-title">
                        {section.title}
                      </h2>
                    </div>

                    <span className="lesson-card-status">
                      {isOpen ? "Close" : "Open"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="lesson-card-body">
                      <div className="lesson-card-content">
                        {section.content}
                      </div>

                      <div className="lesson-card-actions">
                        <button
                          onClick={() => setOpenSection(null)}
                          className="lesson-close-button">
                          Close Section
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
