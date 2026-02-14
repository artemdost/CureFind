export interface Service {
  slug: string;
  icon: string;
  translationKey: string;
}

export const services: Service[] = [
  {
    slug: 'dentistry',
    icon: '🦷',
    translationKey: 'services.dentistry',
  },
  {
    slug: 'gynecology',
    icon: '👩‍⚕️',
    translationKey: 'services.gynecology',
  },
  {
    slug: 'phlebology',
    icon: '🩸',
    translationKey: 'services.phlebology',
  },
];
