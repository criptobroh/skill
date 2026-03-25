/**
 * Sistema de branding configurable
 *
 * Para cambiar de marca, modificar NEXT_PUBLIC_BRAND en .env.local:
 * - NEXT_PUBLIC_BRAND=ieb     -> Grupo IEB
 * - NEXT_PUBLIC_BRAND=psi     -> PSI Mammoliti
 */

export type BrandId = 'ieb' | 'psi';

export interface BrandConfig {
  id: BrandId;
  name: string;
  shortName: string;
  logo: string;
  tagline: string;
  footer: string;
}

const brands: Record<BrandId, BrandConfig> = {
  ieb: {
    id: 'ieb',
    name: 'Grupo IEB',
    shortName: 'IEB',
    logo: '/brands/ieb/logo.png',
    tagline: 'Plataforma interna',
    footer: 'Grupo IEB',
  },
  psi: {
    id: 'psi',
    name: 'PSI Mammoliti',
    shortName: 'PSI',
    logo: '/brands/psi/logo.png',
    tagline: 'Plataforma interna',
    footer: 'PSI Mammoliti',
  },
};

// Default brand if not configured
const DEFAULT_BRAND: BrandId = 'ieb';

export function getBrandId(): BrandId {
  const envBrand = process.env.NEXT_PUBLIC_BRAND as BrandId;
  return envBrand && brands[envBrand] ? envBrand : DEFAULT_BRAND;
}

export function getBrand(): BrandConfig {
  return brands[getBrandId()];
}

// Export for use in components
export const brand = getBrand();
