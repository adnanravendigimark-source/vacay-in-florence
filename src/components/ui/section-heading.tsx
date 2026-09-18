export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "inverted";
}) {
  const isInverted = tone === "inverted";

  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p
          className={`mb-2 text-sm font-semibold uppercase tracking-[0.14em] ${
            isInverted ? "text-gold-light" : "text-terracotta"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl ${
          isInverted ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`mt-3 text-base ${isInverted ? "text-cream/75" : "text-ink-soft"}`}>{description}</p>
      ) : null}
    </div>
  );
}
