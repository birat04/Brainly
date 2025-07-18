import type { ReactElement } from "react";

interface ButtonInterface {
  title: string;
  size: "lg" | "sm" | "md";
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  variant: "primary" | "secondary";
  onClick?: () => void;
  fullWidth?: boolean;
  loading?: boolean;
}

const sizeStyles = {
  lg: "px-8 py-4 text-xl rounded-xl",
  md: "px-4 py-2 text-md rounded-md",
  sm: "px-2 py-1 text-sm rounded-sm",
};

const variantStyles = {
  primary: "bg-purple-600 text-white",
  secondary: "bg-purple-200 text-purple-600",
};

const defaultStyles =
  "font-light flex justify-center items-center gap-2 transition";

export function Button(props: ButtonInterface) {
  const {
    title,
    size,
    startIcon,
    endIcon,
    variant,
    onClick,
    fullWidth,
    loading,
  } = props;

  return (
    <button
      type="button"
      className={`
        ${sizeStyles[size]} 
        ${variantStyles[variant]} 
        ${defaultStyles} 
        ${fullWidth ? "w-full" : "mx-auto"} 
        ${loading ? "opacity-60 cursor-not-allowed" : ""}
      `}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Processing…</span>
        </>
      ) : (
        <>
          {startIcon && <span className="text-sm">{startIcon}</span>}
          <span>{title}</span>
          {endIcon}
        </>
      )}
    </button>
  );
}
