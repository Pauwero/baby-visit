type Props = {
  className?: string;
};

export default function Sprig({ className }: Props) {
  return (
    <svg
      viewBox="0 0 80 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 12 C 20 12, 30 12, 78 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path d="M14 12 q 4 -7 11 -8" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M14 12 q 4 7 11 8" stroke="currentColor" strokeWidth="1" fill="none" />
      <ellipse
        cx="22"
        cy="6"
        rx="5"
        ry="2.2"
        transform="rotate(-30 22 6)"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse
        cx="22"
        cy="18"
        rx="5"
        ry="2.2"
        transform="rotate(30 22 18)"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M30 12 q 5 -6 13 -7" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M30 12 q 5 6 13 7" stroke="currentColor" strokeWidth="1" fill="none" />
      <ellipse
        cx="40"
        cy="7"
        rx="5"
        ry="2.2"
        transform="rotate(-25 40 7)"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse
        cx="40"
        cy="17"
        rx="5"
        ry="2.2"
        transform="rotate(25 40 17)"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse
        cx="58"
        cy="9"
        rx="4"
        ry="1.8"
        transform="rotate(-20 58 9)"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse
        cx="58"
        cy="15"
        rx="4"
        ry="1.8"
        transform="rotate(20 58 15)"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
