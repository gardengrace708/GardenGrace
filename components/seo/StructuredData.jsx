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
    name: 'MAKHSOOS',
    url: 'https://makhsoos.shop',
    logo: 'https://makhsoos.shop/images/logo.png',
    description: 'MAKHSOOS - Luxury Pakistani clothing crafted for men who carry culture with confidence. Premium menswear including kurtas, shalwar kameez, and traditional wear.',
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
      email: 'makhsoos708@gmail.com',
      areaServed: 'PK',
      availableLanguage: 'English, Urdu'
    },
    sameAs: [
      'https://www.tiktok.com/@makhsoos_men',
      'https://www.instagram.com/makhsoos_men'
    ]
  };

  return <StructuredData data={schema} />;
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MAKHSOOS',
    url: 'https://makhsoos.shop',
    description: 'Shop premium men\'s clothing at MAKHSOOS. Discover luxury Pakistani fashion including kurtas, shalwar kameez, waistcoats, and traditional wear.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://makhsoos.shop/shop?q={search_term_string}',
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
      name: 'MAKHSOOS'
    },
    offers: {
      '@type': 'Offer',
      url: `https://makhsoos.shop/products/${product.id}`,
      priceCurrency: 'PKR',
      price: product.price,
      availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'MAKHSOOS'
      }
    },
    category: product.category || 'Men\'s Clothing'
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
      item: `https://makhsoos.shop${item.url}`
    }))
  };

  return <StructuredData data={schema} />;
}
