import type { ReactElement } from "react";

interface ButtonInterface {
  title: string;
  size: "lg" | "sm" | "md";
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  variant: "primary" | "secondary";
  onClick?: () => void;
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

const defaultStyles = "font-light flex justify-center items-center gap-2";

export function Button(props: ButtonInterface) {
  return (
    <button
      className={`${sizeStyles[props.size]} ${variantStyles[props.variant]} ${defaultStyles}`}
      onClick={props.onClick}
    >
      {props.startIcon && <span className="text-sm">{props.startIcon}</span>}
      <span>{props.title}</span>
      {props.endIcon}
    </button>
  );
}
