import PageNav from "@/components/page-nav";

type TeamMember = {
  name: string;
  image: string;
  description: string;
};

export default function MeetOurTeam() {
  const team: TeamMember[] = [
    {
      name: "Noxu Nyaaa",
      image: "/team/noxu.jpg",
      description: "Team Lead Developer, Front end and UI specialist.",
    },
    {
      name: "Thunthanut Teemaethawee",
      image: "/team/Jeyllyrez.png",
      description: "Frontend Developer, UI/UX enthusiast.",
    },
    {
      name: "Koses Suvarnasuddhi",
      image: "/team/koses.png",
      description: "Backend Developer & Database Specialist.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Meet Our Team</h1>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm"
            >
              <img
                src={member.image}
                alt={member.name}
                className="mb-4 h-40 w-40 rounded-full object-cover shadow"
              />
              <h2 className="text-xl font-semibold mb-2">{member.name}</h2>
              <p className="text-sm text-muted-foreground">{member.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
