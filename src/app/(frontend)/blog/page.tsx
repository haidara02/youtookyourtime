export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "Collection #3 Saigon, district 5",
      image: "67",
      subtitle: null,
      date: "20250718",
    },
    {
      id: 2,
      title: "Collection #2 Saigon, District 5 (OBJOFF stock)",
      subtitle: null,
      image: "67",
      date: "20250718",
    },
    {
      id: 3,
      title: "Array Store shootss ytyt tights w Nguyet.",
      subtitle: null,
      image: "67",
      date: "20250718",
    },
    {
      id: 4,
      title: "Collection #1 Saigon, District 5",
      subtitle: null,
      image: "67",
      date: "20250718",
    },
    {
      id: 5,
      title: "Collaboration with Haromi Poutapu AKA Romi in da house.",
      subtitle:
        "1.Haromi Poutapu (AKA Romi-in-da-house) is Meanjin's mag - num opus. The Aotearoa born, 2.Logan raised DJ spins the kind of big ballads...",
      image: "67",
      date: "20250718",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium mb-5">All Posts</p>
      <div className="space-y-12">
        {posts.map((p) => (
          <article key={p.id} className="grid gap-6 md:grid-cols-2">
            <div className="aspect-video bg-gray-100">
              <div className="flex h-full items-center justify-center text-gray-400">
                {p.image}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-xl font-medium">{p.title}</h2>
              {p.subtitle && <p className="text-xs">{p.subtitle}</p>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
