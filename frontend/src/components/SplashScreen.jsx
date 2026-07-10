import { BRAND } from "@/lib/config";

export default function SplashScreen({ onExited }) {
  return (
    <div
      data-testid="splash-screen"
      className="splash-out fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950"
      onAnimationEnd={(e) => {
        if (e.animationName && e.animationName.toLowerCase().includes("splashout")) {
          onExited?.();
        }
      }}
    >
      <div className="hero-gradient absolute inset-0 opacity-60" />
      <div className="relative flex flex-col items-center">
        <div className="logo-in rounded-3xl bg-white p-4 glow-indigo">
          <img
            src={BRAND.logo}
            alt="BookMyHomez"
            className="h-24 w-24 rounded-2xl object-contain md:h-28 md:w-28"
          />
        </div>
        <p
          className="rise-in mt-8 font-display text-3xl font-semibold tracking-tight text-white md:text-4xl"
          style={{ animationDelay: "0.4s" }}
        >
          BookMyHomez
        </p>
        <div
          className="line-grow mt-4 h-[2px] bg-indigo-500"
          style={{ animationDelay: "0.7s", width: 0 }}
        />
        <p
          className="rise-in mt-4 text-xs uppercase tracking-[0.35em] text-slate-400"
          style={{ animationDelay: "0.9s" }}
        >
          Your Happy Home Partner
        </p>
      </div>
    </div>
  );
}
