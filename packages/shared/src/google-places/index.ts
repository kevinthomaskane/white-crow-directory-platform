export const placeDetailsFieldMask = [
  'id',
  'displayName',
  'formattedAddress',
  'addressComponents',
  'location',
  'websiteUri',
  'nationalPhoneNumber',
  'editorialSummary',
  'regularOpeningHours',
  'photos',
  'rating',
  'reviews',
  'googleMapsUri',
  'userRatingCount',
];

export type Review = {
  name: string;
  rating: number;
  text: { text: string };
  publishTime: string;
  authorAttribution?: {
    displayName: string;
    photoUri: string;
    uri: string;
  };
};

export type AddressComponent = {
  types?: string[];
  longText: string;
};

export function parseAddressComponents(components: AddressComponent[]) {
  const result = {
    streetNumber: '',
    route: '',
    city: '',
    state: '',
    postalCode: '',
  };

  const typeMap: Record<string, keyof typeof result> = {
    street_number: 'streetNumber',
    route: 'route',
    locality: 'city',
    administrative_area_level_1: 'state',
    postal_code: 'postalCode',
  };

  for (const component of components) {
    for (const type of component.types ?? []) {
      const key = typeMap[type];
      if (!key) continue;
      if (result[key]) continue;

      result[key] = component.longText;
      break;
    }
  }

  return {
    streetAddress: [result.streetNumber, result.route].filter(Boolean).join(' '),
    city: result.city,
    state: result.state,
    postalCode: result.postalCode,
  };
}
