export default function AboutPage() {
  return (
    <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:max-w-9/10">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="flex h-full items-center justify-center">
          <div className="space-y-6 max-w-80">
            <div className="flex gap-4 justify-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-4xl">
                  ♲
                </div>
              ))}
            </div>

            <p className="text-sm leading-relaxed">
              You Took Your Time steps in the direction of circular fashion,
              having all the materials sourced from second-hand stores that
              supports Australian organised charities.
            </p>

            <p className="text-sm leading-relaxed">
              You Took Your Time is based on the east coast of Australia and
              aims to bring together and encourage creative people!
            </p>
          </div>
        </div>

        <div className="aspect-square bg-gray-100">
          <div className="flex h-full items-center justify-center text-gray-400">
            Image
          </div>
        </div>
      </div>
    </div>
  );
}
