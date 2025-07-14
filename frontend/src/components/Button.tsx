import type { ReactElement } from "react";

interface ButtonInterface {
    title: string;
    size: "lg" | "sm" | "md";
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    variant: "primary" | "secondary";
}

const sizeStyles = {
    "lg": "px-8 py-4 text-xl rounded-xl",
    "md": "px-4 py-2 text-md rounded-md",
    "sm": "px-2 py-1 text-sm rounded-sm",
}


const variantStyles = {
    "primary": "bg-purple-600 text-white p-4",
    "secondary": "bg-purple-200 text-purple-600 p-4",
}
const defaultStyles = "px-4 py-2 rounded-md font-light flex justify-center";
export function Button(props: ButtonInterface) {
    return <button className={sizeStyles[props.size] + " " + variantStyles[props.variant] + " " + defaultStyles}>
        <div className="flex items-center gap-2">
            <span className="text-sm">
                {props.startIcon}
            </span>
            <div className="pl-2 pr-2">
                {props.title}
            </div>
            {props.endIcon}
        </div>
    </button>
}