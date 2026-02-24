import { getDomainProductBySlug } from "@/lib/domain-products";

export function getActiveDomainProduct() {
  const slug = process.env.NEXT_PUBLIC_ACTIVE_DOMAIN_SLUG?.trim();
  if (!slug) {
    return null;
  }
  return getDomainProductBySlug(slug) ?? null;
}
