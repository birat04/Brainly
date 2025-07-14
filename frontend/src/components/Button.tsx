interface ButtonProps{
    variant: 'primary' | 'secondary';
    text: string;
    startIcon?: React.ReactNode;
    
}
const variantClasses = {
    "primary": "bg-purple-600 text-white p-4",
    "secondary": "bg-purple-200 text-purple-600 p-4",
};
const defaultStyles = "px-4 py2 rounded-md"

export function Button({ variant, text, startIcon }: ButtonProps) {
  return (
    <button className={variantClasses[variant] + " " + defaultStyles}>
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {text}
    </button>
  );
}

