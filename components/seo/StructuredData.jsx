export default function StructuredData({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GardenGrace',
    url: 'https://GardenGrace.pk',
    logo: 'https://GardenGrace.pk/images/logo.png',
    description: 'GardenGrace - Premium Pakistani furniture crafted for those who value quality and style. Premium furniture including sofas, beds, dining tables, and home decor.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Faisalabad',
      addressLocality: 'Faisalabad',
      addressCountry: 'PK'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-328-0362181',
      contactType: 'customer service',
      email: 'GardenGrace708@gmail.com',
      areaServed: 'PK',
      availableLanguage: 'English, Urdu'
    },
    sameAs: [
      'https://www.tiktok.com/@GardenGrace_men',
      'https://www.instagram.com/GardenGrace_men'
    ]
  };

  return <StructuredData data={schema} />;
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GardenGrace',
    url: 'https://GardenGrace.pk',
    description: 'Shop premium furniture at GardenGrace. Discover luxury Pakistani furniture including sofas, beds, dining tables, and home decor.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://GardenGrace.pk/shop?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return <StructuredData data={schema} />;
}

export function ProductSchema({ product }) {
  if (!product) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [product.image],
    description: product.description,
    sku: product.id?.toString(),
    brand: {
      '@type': 'Brand',
      name: 'GardenGrace'
    },
    offers: {
      '@type': 'Offer',
      url: `https://GardenGrace.pk/products/${product.id}`,
      priceCurrency: 'PKR',
      price: product.price,
      availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'GardenGrace'
      }
    },
    category: product.category || 'Furniture'
  };

  return <StructuredData data={schema} />;
}

export function BreadcrumbSchema({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://GardenGrace.pk${item.url}`
    }))
  };

  return <StructuredData data={schema} />;
}
