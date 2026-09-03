export default function CurrencySelector() {
  return (
    <div className="relative inline-flex items-center">
      <select
        defaultValue="VND"
        aria-label="Currency"
        className="cursor-pointer appearance-none bg-transparent pr-4 text-base font-bold hover:text-brand-red transition-colors focus:outline-none"
      >
        <option value="VND">VND</option>
      </select>
      <svg
        viewBox="0 0 10 6"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-0 h-2 w-3"
      >
        <path
          d="M1 1l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
