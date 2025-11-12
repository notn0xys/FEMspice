import PageNav from "@/components/page-nav";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const featureHighlights = [
    {
        title: "Drag-and-Drop Circuit Builder",
        description:
            "Sketch circuits directly on the canvas with a growing library of components, including voltage, current, and pulse sources.",
    },
    {
        title: "Theme-Aware Visualization",
        description:
            "Switch between light and dark mode and watch components, wires, and measurements adapt instantly for better readability.",
    },
    {
        title: "Simulation Feedback",
        description:
            "Run DC or AC analyses, visualize node voltages and component currents, and iterate quickly with responsive overlays.",
    },
    {
        title: "Persistent Circuits",
        description:
            "Save, load, and share circuit drafts. Component metadata travels end-to-end, including pulse waveform settings.",
    },
];

const techStack = [
    "React 18 + TypeScript",
    "Vite + Tailwind CSS",
    "React-Konva canvas rendering",
    "shadcn/ui component library",
    "FastAPI backend with Python",
    "JWT-secured authentication",
];

function About() {
    return (
        <div className="min-h-screen bg-background">
            <PageNav />
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 lg:px-8">
                <section className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        <span>FEMspice</span>
                        <span>Interactive Circuit Simulation Platform</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Design, simulate, and iterate on circuits without friction.
                    </h1>
                    <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                        FEMspice combines an intuitive drag-and-drop editor with a fast simulation backend so you can explore circuit ideas quickly. Whether you are prototyping analog designs, teaching fundamentals, or validating signal behavior, FEMspice streamlines the process from schematic to insight.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold">What you can do</h2>
                    <div className="mt-4 grid gap-6 sm:grid-cols-2">
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

                <section className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Under the hood</CardTitle>
                            <CardDescription>
                                A modern stack keeps the editing experience snappy while the backend handles simulation and persistence.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                                {techStack.map((tech) => (
                                    <li key={tech}>{tech}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Roadmap</CardTitle>
                            <CardDescription>
                                We are expanding the component catalog, simulation depth, and collaboration features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Upcoming enhancements include:</p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>SPICE netlist export for deeper analysis.</li>
                                <li>Transient simulation with waveform plotting.</li>
                                <li>Shared workspaces for classroom collaboration.</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            Interested in contributing? Reach out or open a pull request—FEMspice thrives on community feedback.
                        </CardFooter>
                    </Card>
                </section>
            </main>
        </div>
    );
}

export default About;