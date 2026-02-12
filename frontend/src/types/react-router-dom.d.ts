declare module "react-router-dom" {
  export interface NavigateFunction {
    (to: string, options?: { replace?: boolean; state?: unknown }): void;
  }

  export function useNavigate(): NavigateFunction;
}


