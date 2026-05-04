export default function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1080 1080" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cloudepay-mark" x1="150" y1="80" x2="910" y2="1000" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb5a7c" />
          <stop offset="0.48" stopColor="#e9144e" />
          <stop offset="1" stopColor="#9f1239" />
        </linearGradient>
      </defs>

      <path
        d="M467 35c45-28 102-28 147 0l104 64c45 28 80 39 133 45l121 15c56 7 100 51 107 107l15 121c7 53 17 88 45 133l64 104c28 45 28 102 0 147l-64 104c-28 45-39 80-45 133l-15 121c-7 56-51 100-107 107l-121 15c-53 7-88 17-133 45l-104 64c-45 28-102 28-147 0l-104-64c-45-28-80-39-133-45l-121-15c-56-7-100-51-107-107L-13 908c-7-53-17-88-45-133l-64-104c-28-45-28-102 0-147l64-104c28-45 39-80 45-133L2 266c7-56 51-100 107-107l121-15c53-7 88-17 133-45L467 35Z"
        fill="url(#cloudepay-mark)"
      />
      <path
        d="M55 162c160 39 280 142 346 294"
        stroke="white"
        strokeOpacity="0.58"
        strokeWidth="55"
        strokeLinecap="round"
      />
      <path
        d="M392 453c80-139 230-223 389-200 189 27 320 203 293 392-27 189-203 320-392 293-116-17-213-91-263-194"
        stroke="white"
        strokeWidth="70"
        strokeLinecap="round"
      />
      <circle cx="390" cy="570" r="60" fill="white" />
    </svg>
  );
}