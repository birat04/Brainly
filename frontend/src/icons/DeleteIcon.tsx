interface DeleteIconProps {
  className?: string;
  onClick?: () => void;
}

export function DeleteIcon({ className = "w-5 h-5", onClick }: DeleteIconProps) {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`${className} cursor-pointer`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21..."
      />
    </svg>
  );
}
