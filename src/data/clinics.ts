export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewCount: number;
  initials: string;
  color: string;
  education: string;
  about: string;
}

export interface ServicePrice {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  region: string;
  regionId: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  phone: string;
  workHours: string;
  description: string;
  specialties: string[];
  doctors: Doctor[];
  services: ServicePrice[];
  verified: boolean;
  yearOpened: number;
}

export interface Region {
  id: string;
  name: string;
  lat: number;
  lng: number;
  clinicCount: number;
}
