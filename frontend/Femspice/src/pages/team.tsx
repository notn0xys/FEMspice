type TeamMember = {
  name: string;
  image: string;
  description: string;
};

export default function MeetOurTeam() {
  const team: TeamMember[] = [
    {
      name: "Person 1 aki ig",
      image: "/team/",
      description: "Team Lead & Developer, loves circuits and coding.",
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
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Meet Our Team</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-6xl">
        {team.map((member) => (
          <div
            key={member.name}
            className="flex flex-col items-center text-center rounded-lg shadow-md p-4"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-40 h-40 rounded-full object-cover mb-4 shadow"
            />
            <h2 className="text-xl font-semibold mb-2">{member.name}</h2>
            <p className="text-sm">{member.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
