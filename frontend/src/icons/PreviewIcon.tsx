interface PreviewIconProps {
  className?: string;
}

export function PreviewIcon({ className = "w-5 h-5" }: PreviewIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5} 
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round" 
        strokeLinejoin="round"
        d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
      />
    </svg>
  );
}
