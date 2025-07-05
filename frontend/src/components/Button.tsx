export interface ButtonProps{
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'sm' | 'md' | 'lg';
  text: string;
  startIcon?:React.ReactNode;
  endIcon?:React.ReactNode;
  onClick?: () => void;
}

export const Button = (props: ButtonProps) => {
  return <button onClick={props.onClick}>{props.text}</button>;
}

<Button variant="primary" size="md" onClick={} text = {} startIcon={<Icon />} endIcon={<Icon />}>
</Button>
