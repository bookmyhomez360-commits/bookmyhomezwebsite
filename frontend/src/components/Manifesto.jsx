import { motion } from "framer-motion";

const CHAPTERS = [
  {
    n: "01",
    title: "Homes with a soul",
    body: "We don't list boxes. Every home is visited, verified and chosen for the way it makes you feel the moment you walk in.",
  },
  {
    n: "02",
    title: "Honest, upfront pricing",
    body: "No inflated numbers, no hidden brokerage games. What you see is what you pay — transparency is the whole point.",
  },
  {
    n: "03",
    title: "A partner, not a portal",
    body: "From the first visit to the final handshake, a real human walks with you. Because a home is a decision, not a transaction.",
  },
];

const MARQUEE = [
  "Curated Homes",
  "Verified Listings",
  "Honest Pricing",
  "Happy Families",
  "Trusted Agents",
  "Move-in Ready",
];

export default function Manifesto() {
  return (
    <section data-testid="manifesto" className="relative py-24 md:py-32">
      {/* Marquee */}
      <div className="marquee-mask mb-24 overflow-hidden border-y border-white/10 py-6">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span
              key={i}
              className="font-display text-4xl font-medium tracking-tight text-white/90 md:text-6xl"
            >
              {m}
              <span className="mx-8 text-indigo-500">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 max-w-3xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-indigo-400">
            Our promise
          </p>
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
            Three things we&apos;ll never compromise on.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {CHAPTERS.map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative bg-slate-950 p-8 transition-colors duration-300 hover:bg-slate-900 md:p-10"
            >
              <span className="text-stroke font-display text-7xl font-bold md:text-8xl">
                {c.n}
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-white">
                {c.title}
              </h3>
              <p className="mt-3 text-slate-400">{c.body}</p>
              <span className="mt-6 block h-px w-0 bg-indigo-500 transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
