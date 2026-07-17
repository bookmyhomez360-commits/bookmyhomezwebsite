import { motion } from "framer-motion";

export function ListPropertySection({ onOpen }) {
  return (
    <section data-testid="list-property-cta" className="relative bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 px-6 py-16 md:px-16 md:py-24"
        >
          <div className="hero-gradient absolute inset-0 opacity-70" />
          <div className="relative z-10 max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-indigo-400">
              Property owners &amp; agents
            </p>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              List your property — <span className="italic text-indigo-400">free.</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              Zero brokerage, verified enquiries, and a dashboard to manage your
              listings and leads. Sign in, add photos &amp; a video, and go live in minutes.
            </p>
            <button
              data-testid="cta-list-property"
              onClick={onOpen}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95"
            >
              Start listing — it&apos;s free
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
