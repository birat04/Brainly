type ButtonVariant = 'primary' | 'secondary';
type SizeVariant = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant: ButtonVariant;
  size: SizeVariant;
  text: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-700 active:scale-95',
  secondary: 'bg-blue-300 text-blue-800 hover:bg-blue-400 active:scale-95',
};

const sizeStyles: Record<SizeVariant, string> = {
  sm: 'py-1 px-2 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-3 px-6 text-lg',
};

const defaultStyles =
  'rounded-md flex items-center gap-2 transition duration-150 ease-in-out cursor-pointer';

export const Button = ({ variant, size, text, startIcon, endIcon, onClick }: ButtonProps) => {
  const classNames = `${defaultStyles} ${variantStyles[variant]} ${sizeStyles[size]}`;

  return (
    <button className={classNames} onClick={onClick}>
      {startIcon && <span>{startIcon}</span>}
      <span>{text}</span>
      {endIcon && <span>{endIcon}</span>}
    </button>
  );
};
