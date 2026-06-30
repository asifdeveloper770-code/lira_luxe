import { Logo } from "./Logo";

export function IntroOverlay() {
  return (
    <div className="intro-overlay fixed inset-0 z-[100] overflow-hidden pointer-events-none animate-fade-out">

      {/* Venetian Blinds */}
      <div className="absolute inset-0 flex">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="blind flex-1 h-full animate-blind"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')",
              backgroundSize: "100vw 100vh",
              backgroundRepeat: "no-repeat",
              backgroundPosition: `${(i * 100) / 4}% center`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center h-full bg-ink backdrop-blur-sm animate-home-reveal">
        <div className="text-center animate-content">
          <Logo className="w-[75vw] max-w-[500px] mx-auto" />

          <h1 className="mt-4 text-4xl sm:text-5xl font-serif tracking-wide text-gold animate-text">
            Welcome to Lira Fashion
          </h1>

          <div className="line-grow w-40 h-px mx-auto mt-6 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
      .animate-home-reveal {
            animation: homeReveal 2.8s ease forwards;
          }

          @keyframes homeReveal {
            0% {
              transform: scale(1);
              opacity: 1;
            }

            70% {
              transform: scale(1);
              opacity: 1;
            }

            100% {
              transform: scale(1.08);
              opacity: 0;
            }
          }
        .animate-blind {
          transform: scaleY(1);
          transform-origin: center;
          animation: openBlinds 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }

        .animate-content {
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          animation: contentReveal 1.2s ease forwards;
        }

        .animate-text {
          opacity: 0;
          letter-spacing: 0.3em;
          animation: textReveal 1s ease forwards;
          animation-delay: 0.4s;
        }

        .line-grow {
          transform: scaleX(0);
          transform-origin: center;
          animation: lineGrow 1s ease forwards;
          animation-delay: 0.8s;
        }

        .animate-fade-out {
        animation: overlayFade 4.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;   
          }

        @keyframes openBlinds {
          0% {
            transform: scaleY(1);
          }

          100% {
            transform: scaleY(0);
          }
        }

        @keyframes contentReveal {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes textReveal {
          0% {
            opacity: 0;
            letter-spacing: 0.5em;
          }

          100% {
            opacity: 1;
            letter-spacing: 0.08em;
          }
        }

        @keyframes lineGrow {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }

          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @keyframes overlayFade {
          0% {
            opacity: 1;
            visibility: visible;
          }

          85% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}

export default IntroOverlay;