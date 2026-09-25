import { authPaths } from "@/features/auth";

export const publicNav = [
  { to: "/", label: "Home" },
  { to: "/product", label: "Product" },
  { to: "/security", label: "Security" },
  { to: "/who", label: "Who it is for" },
  { to: "/contact", label: "Contact" },
] as const;

export const marketingPaths = ["/", "/product", "/security", "/who", "/contact"] as const;

export function isPublicPath(pathname: string) {
  return (
    (marketingPaths as readonly string[]).includes(pathname) ||
    (authPaths as readonly string[]).includes(pathname)
  );
}
