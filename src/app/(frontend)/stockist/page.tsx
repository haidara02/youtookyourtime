type StockistLocation = {
  name: string;
  address: string;
  instagramUrl: string;
  mapsUrl: string;
};

type StockistGroup = {
  title: string;
  locations: StockistLocation[];
};

const STOCKISTS: StockistGroup[] = [
  {
    title: "YTYT HÀ NỘI",
    locations: [
      {
        name: "Placeholder Store A",
        address: "123 Placeholder Street, Hà Nội",
        instagramUrl: "https://instagram.com/placeholder",
        mapsUrl: "https://maps.google.com/?q=123+Placeholder+Street+Ha+Noi",
      },
      {
        name: "Placeholder Store B",
        address: "456 Placeholder Street, Hà Nội",
        instagramUrl: "https://instagram.com/placeholder",
        mapsUrl: "https://maps.google.com/?q=456+Placeholder+Street+Ha+Noi",
      },
    ],
  },
  {
    title: "YTYT HUẾ",
    locations: [
      {
        name: "Placeholder Store A",
        address: "789 Placeholder Street, Huế",
        instagramUrl: "https://instagram.com/placeholder",
        mapsUrl: "https://maps.google.com/?q=789+Placeholder+Street+Hue",
      },
    ],
  },
  {
    title: "YTYT SÀI GÒN",
    locations: [
      {
        name: "Placeholder Store A",
        address: "12 Placeholder Street, Sài Gòn",
        instagramUrl: "https://instagram.com/placeholder",
        mapsUrl: "https://maps.google.com/?q=12+Placeholder+Street+Sai+Gon",
      },
      {
        name: "Placeholder Store B",
        address: "34 Placeholder Street, Sài Gòn",
        instagramUrl: "https://instagram.com/placeholder",
        mapsUrl: "https://maps.google.com/?q=34+Placeholder+Street+Sai+Gon",
      },
    ],
  },
  {
    title: "YTYT AUSTRALIA",
    locations: [
      {
        name: "Placeholder Store A",
        address: "56 Placeholder Street, Sydney, Australia",
        instagramUrl: "https://instagram.com/placeholder",
        mapsUrl: "https://maps.google.com/?q=56+Placeholder+Street+Sydney",
      },
    ],
  },
];

export default function StockistPage() {
  return (
    <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:max-w-9/10">
      <h1 className="text-center text-4xl font-bold tracking-wide sm:text-5xl mb-16">
        Stockist
      </h1>

      <div className="space-y-16">
        {STOCKISTS.map((group) => (
          <div key={group.title} className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-6">
              <h2 className="text-2xl font-bold">{group.title}</h2>
              <ul className="space-y-3">
                {group.locations.map((location) => (
                  <li key={location.name + location.address}>
                    <a
                      href={location.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-brand-red transition-colors"
                    >
                      {location.name}
                    </a>
                    {" — "}
                    <a
                      href={location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-red transition-colors"
                    >
                      {location.address}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative aspect-square bg-gray-100">
              <div className="flex h-full items-center justify-center text-gray-400">
                Image
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
