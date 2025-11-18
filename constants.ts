import { PriceItem } from './types';

export const SIZES: string[] = [
  '120см × 2м',
  '120см × 180см',
  '120см × 150см',
  '1м × 2м',
  '1м × 175см',
  '1м × 150см',
  '90см × 150см',
  '80см × 150см',
  '80см × 130см',
  '80см × 120см',
  '75см × 150см',
  '1м × 180см',
];

export const PRICES_DATA: PriceItem[] = [
  { size: '120см × 2м', taer: 500, opt: 550, nacenka: 50 },
  { size: '120см × 180см', taer: 450, opt: 500, nacenka: 50 },
  { size: '120см × 150см', taer: 350, opt: 400, nacenka: 50 },
  { size: '1м × 2м', taer: 400, opt: 450, nacenka: 50 },
  { size: '1м × 175см', taer: 350, opt: 400, nacenka: 50 },
  { size: '1м × 150см', taer: 300, opt: 330, nacenka: 30 },
  { size: '90см × 150см', taer: 280, opt: 310, nacenka: 30 },
  { size: '80см × 150см', taer: 240, opt: 280, nacenka: 40 },
  { size: '80см × 130см', taer: 220, opt: 250, nacenka: 30 },
  { size: '80см × 120см', taer: 190, opt: 220, nacenka: 30 },
  { size: '75см × 150см', taer: 220, opt: 250, nacenka: 30 },
  { size: '1м × 180см', taer: 380, opt: 430, nacenka: 50 },
];


export const QUANTITIES: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

export const SOLD_TO_OPTIONS: string[] = [
  'Суҳайлӣ',
  'Шоҳрух',
  'Столмебел',
  'Мизоҷ',
];