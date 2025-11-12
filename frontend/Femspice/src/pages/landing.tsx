import PageNav from "@/components/page-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

const featureHighlights = [
  {
    title: "Drag-and-drop schematics",
    description:
      "Arrange resistors, sources, and probes on an infinite canvas with snap-to-grid precision and keyboard shortcuts.",
  },
  {
    title: "Pulse-aware simulation",
    description:
      "Dial in pulse sources with rise, fall, and duty cycle controls, then export settings directly to the backend.",
  },
  {
    title: "Context-rich analysis",
    description:
      "Inspect node voltages, component currents, and validation hints without leaving the editor.",
  },
  {
    title: "Dark mode optimized",
    description:
      "Switch themes instantly. Component artwork, overlays, and typography stay crisp in any environment.",
  },
];

const quickStart = [
  {
    step: "Create your account",
    description: "Sign up in seconds and sync your work securely with token-based auth.",
  },
  {
    step: "Sketch your circuit",
    description: "Drop in components, wire them up, and configure sources with intelligent defaults.",
  },
  {
    step: "Simulate and iterate",
    description: "Run analyses, adjust parameters, and export results to share with your team.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PageNav />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-12 lg:px-8">
        <section className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              <span>FEMspice</span>
              <span>Finite element circuit exploration</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Bring your circuits to life in a browser-based lab.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              FEMspice combines an intuitive schematic editor with fast, repeatable simulation flows. Prototype signal chains, validate component choices, and stay in sync with your team from anywhere.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/login">Start building</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">See how it works</Link>
              </Button>
            </div>
            <dl className="grid gap-6 text-sm text-muted-foreground sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-foreground">Component library</dt>
                <dd>Growing catalog of sources, passives, and analysis probes.</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Collaboration ready</dt>
                <dd>Share circuits via saved projects or export netlists in seconds.</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Theme aware</dt>
                <dd>Light and dark palettes tuned for readability during long sessions.</dd>
              </div>
            </dl>
          </div>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Why engineers choose FEMspice</CardTitle>
              <CardDescription>
                Unified workspace for drafting, simulating, and presenting circuit ideas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Replace scattered tooling with a focused editor that keeps context on the canvas.
              </p>
              <p>
                Pulse sources, tutorials, and validation checks are ready out of the box, so you can focus on the decisions that matter.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Everything you need to get started</h2>
              <p className="text-sm text-muted-foreground">
                Circuit designers, students, and researchers rely on FEMspice for fast iteration.
              </p>
            </div>
            <Button asChild variant="ghost" className="self-start md:self-auto">
              <Link to="/signup">Create a free account</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featureHighlights.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {quickStart.map((item) => (
            <Card key={item.step}>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  {item.step}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="rounded-xl border bg-muted/40 px-6 py-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to iterate faster?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Log in to jump back into your workspace or onboard your team with a shared project.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;
