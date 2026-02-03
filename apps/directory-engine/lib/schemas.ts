// Organization Schema
export const organizationSchema = function ({
  name,
  url,
  logo,
  description,
}: {
  name: string;
  url: string;
  logo: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}#organization`,
    name,
    description,
    url,
    logo,
  };
};

// Website Schema
export const websiteSchema = function ({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    publisher: {
      '@id': `${url}#organization`,
    },
  };
};

// LocalBusiness Schema
interface LocalBusinessSchemaOptions {
  name: string;
  description: string | null;
  telephone: string | null;
  address: string | null;
  aggregateRating: {
    ratingValue: number;
    reviewCount: number;
  } | null;
}

export function getLocalBusinessSchema({
  name,
  description,
  telephone,
  address,
  aggregateRating,
}: LocalBusinessSchemaOptions) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
  };

  if (description) {
    schema.description = description;
  }

  if (telephone) {
    schema.telephone = telephone;
  }

  if (address) {
    schema.address = address;
  }

  if (aggregateRating && aggregateRating.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
    };
  }

  return schema;
}

// CollectionPage Schema generator
export function getCollectionPageSchema(
  name: string,
  description: string,
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    publisher: {
      '@id': `${url}#organization`,
    },
  };
}

// ItemList Schema generator
export function getItemListSchema(
  name: string,
  description: string,
  items: unknown[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item,
    })),
  };
}

// BreadcrumbList Schema generator
export function getBreadcrumbListSchema(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}
