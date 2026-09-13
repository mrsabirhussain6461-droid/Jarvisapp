import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-jarvis-cyan/10 text-jarvis-cyan border border-jarvis-cyan/40 hover:bg-jarvis-cyan/20 hover:border-jarvis-cyan/70 hover:glow-cyan",
        active:
          "bg-jarvis-cyan/25 text-jarvis-cyan border border-jarvis-cyan glow-cyan",
        destructive:
          "bg-jarvis-red/10 text-jarvis-red border border-jarvis-red/40 hover:bg-jarvis-red/20 hover:border-jarvis-red/70 hover:glow-red",
        amber:
          "bg-jarvis-amber/10 text-jarvis-amber border border-jarvis-amber/40 hover:bg-jarvis-amber/20 hover:border-jarvis-amber/70 hover:glow-amber",
        ghost: "text-muted-foreground hover:text-jarvis-cyan hover:bg-jarvis-cyan/5",
        outline:
          "border border-border text-foreground/80 hover:border-jarvis-cyan/50 hover:text-jarvis-cyan",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
