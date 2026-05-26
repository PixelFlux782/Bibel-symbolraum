import Link from "next/link";

type RoomLink = {
  href: string;
  label: string;
  meta?: string;
};

type CinematicRoomProps = {
  eyebrow: string;
  title: string;
  copy: string;
  links?: RoomLink[];
  align?: "left" | "center";
  children?: React.ReactNode;
};

export default function CinematicRoom({
  eyebrow,
  title,
  copy,
  links = [],
  align = "left",
  children,
}: CinematicRoomProps) {
  const centered = align === "center";

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden px-5 pb-14 pt-32 sm:px-8 lg:px-14">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,10,0.42),rgba(3,5,10,0.18)_42%,rgba(3,5,10,0.92))]" />
        <div className="light-pulse absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_22%_24%,rgba(216,195,148,0.12),transparent_26%),radial-gradient(circle_at_72%_66%,rgba(88,148,176,0.11),transparent_24%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div
        className={`symbol-fade-in relative z-10 w-full ${
          centered ? "mx-auto max-w-4xl text-center" : "max-w-5xl"
        }`}
      >
        <p className="mb-5 text-[10px] uppercase tracking-[0.46em] text-gold/75">
          {eyebrow}
        </p>
        <h1 className="symbol-breathe max-w-4xl font-serif text-5xl italic leading-[1.04] text-foreground-strong sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        <p
          className={`mt-7 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-soft sm:text-xl ${
            centered ? "mx-auto" : ""
          }`}
        >
          {copy}
        </p>

        {children ? <div className="mt-10">{children}</div> : null}

        {links.length > 0 ? (
          <div
            className={`mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${
              centered ? "mx-auto max-w-4xl" : "max-w-4xl"
            }`}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group border border-white/10 bg-black/20 px-5 py-4 text-left backdrop-blur-md transition-colors duration-1000 hover:border-gold/25 hover:bg-white/[0.04]"
              >
                {link.meta ? (
                  <span className="block text-[10px] uppercase tracking-[0.32em] text-muted-soft">
                    {link.meta}
                  </span>
                ) : null}
                <span className="mt-2 block font-serif text-xl italic text-foreground-strong">
                  {link.label}
                </span>
                <span className="mt-4 block h-px w-10 bg-gold/45 transition-opacity duration-1000 group-hover:opacity-80" />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
