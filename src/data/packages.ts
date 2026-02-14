export interface Package {
  translationKey: string;
  highlighted: boolean;
}

export const packages: Package[] = [
  {
    translationKey: 'packages.basic',
    highlighted: false,
  },
  {
    translationKey: 'packages.standard',
    highlighted: true,
  },
  {
    translationKey: 'packages.premium',
    highlighted: false,
  },
];
