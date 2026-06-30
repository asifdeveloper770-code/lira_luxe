import { SectionLabel } from "@/components/Reveal";

export default function Account() {
  return (
    <div className="pt-32 pb-24 container-luxe max-w-md">
      <div className="text-center">
        <SectionLabel>
          Votre Compte
        </SectionLabel>

        <h1 className="mt-6 font-serif text-5xl">
          Sign In
        </h1>

        <p className="mt-4 text-foreground/70">
          Access your Salon previews and
          order history.
        </p>
      </div>

      <form
        className="mt-12 space-y-4"
        onSubmit={(e) =>
          e.preventDefault()
        }
      >
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-transparent border border-border focus:border-gold outline-none px-4 py-4 text-sm"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full bg-transparent border border-border focus:border-gold outline-none px-4 py-4 text-sm"
        />

        <button className="btn-gold w-full">
          Enter the Salon
        </button>

        <p className="text-center text-xs text-foreground/60 mt-6">
          New to Lira?{" "}
          <a
            className="text-gold link-underline"
            href="#"
          >
            Create an account
          </a>
        </p>
      </form>
    </div>
  );
}