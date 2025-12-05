// Moldova cities for location selection
export const MOLDOVA_CITIES = [
  'Chișinău',
  'Bălți',
  'Bender (Tighina)',
  'Comrat',
  'Tiraspol',
  'Anenii Noi',
  'Basarabeasca',
  'Briceni',
  'Cahul',
  'Cantemir',
  'Călărași',
  'Căușeni',
  'Cimișlia',
  'Criuleni',
  'Dondușeni',
  'Drochia',
  'Dubăsari',
  'Edineț',
  'Fălești',
  'Florești',
  'Glodeni',
  'Hîncești',
  'Ialoveni',
  'Leova',
  'Nisporeni',
  'Ocnița',
  'Orhei',
  'Rezina',
  'Rîșcani',
  'Sîngerei',
  'Soroca',
  'Strășeni',
  'Șoldănești',
  'Ștefan Vodă',
  'Taraclia',
  'Telenești',
  'Ungheni'
] as const

export type MoldovaCity = typeof MOLDOVA_CITIES[number]

// Currency
export const CURRENCY_SYMBOL = 'MDL'
export const CURRENCY_NAME = 'Moldovan Leu'
