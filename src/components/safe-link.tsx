"use client";
import NextLink from "next/link";
import { useConfirmNavigation } from "./navigation-guard";
export default function SafeLink({ onNavigate, ...props }: React.ComponentProps<typeof NextLink>) {
  const confirm = useConfirmNavigation();
  return <NextLink {...props} onNavigate={event => {
    const destination = typeof props.href === "string" ? new URL(props.href, window.location.href) : null;
    const sameDocument = destination && destination.pathname === location.pathname && destination.search === location.search;
    if (!sameDocument && !confirm()) { event.preventDefault(); return; }
    onNavigate?.(event);
  }} />;
}
