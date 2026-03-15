import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DomainProductContent } from "@/app/components/domain-product-content";
import { getActiveDomainProduct } from "@/lib/active-domain";
import {
  DOMAIN_PRODUCTS,
  getDomainProductBySlug,
} from "@/lib/domain-products";

type Props = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  const activeDomainProduct = getActiveDomainProduct();
  if (activeDomainProduct) {
    return [{ slug: activeDomainProduct.slug }];
  }

  return DOMAIN_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const activeDomainProduct = getActiveDomainProduct();
  if (activeDomainProduct && activeDomainProduct.slug !== params.slug) {
    return {
      title: "ページが見つかりません",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const product = getDomainProductBySlug(params.slug);
  if (!product) {
    return {
      title: "ページが見つかりません",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${product.title} | ${product.domain}`,
    description: product.oneLiner,
    alternates: {
      canonical: `/domains/${product.slug}`,
    },
    openGraph: {
      title: `${product.title} | 別ドメインMVP`,
      description: product.oneLiner,
      type: "website",
      locale: "ja_JP",
    },
  };
}

export default function DomainDetailPage({ params }: Props) {
  const activeDomainProduct = getActiveDomainProduct();
  if (activeDomainProduct && activeDomainProduct.slug !== params.slug) {
    notFound();
  }

  const product = getDomainProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  return (
    <main>
      <div className="container">
        <DomainProductContent product={product} showBackLink />
      </div>
    </main>
  );
}
