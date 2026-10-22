import { Slot } from "radix-ui";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "default" };
export function Button({ className, variant = "primary", size = "default", asChild, ...props }: Props) {
  const Component = asChild ? Slot.Root : "button";
  return <Component className={cn("button", `button-${variant}`, size === "sm" && "button-sm", className)} {...props} />;
}
