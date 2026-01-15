export type SeasonalEntry = {
  product: string;
  availability: 'Alta' | 'Media' | 'Baja' | 'Importado';
  season: string; // Ej. "Enero a Marzo", "Todo el año"
};

// Datos representativos para la temporada actual en Mendoza, Argentina.
// Esta información se actualizaría periódicamente.
export const seasonalData: SeasonalEntry[] = [
  { product: 'Ajo', availability: 'Alta', season: 'Cosecha principal de Nov a Ene' },
  { product: 'Papa', availability: 'Alta', season: 'Todo el año (diferentes variedades)' },
  { product: 'Tomate (Redondo)', availability: 'Alta', season: 'Plena cosecha de Dic a Abr' },
  { product: 'Cebolla', availability: 'Alta', season: 'Todo el año' },
  { product: 'Lechuga', availability: 'Media', season: 'Principalmente primavera y otoño' },
  { product: 'Uva de Mesa', availability: 'Alta', season: 'Cosecha de Ene a Abr' },
  { product: 'Durazno', availability: 'Alta', season: 'Cosecha de Dic a Feb' },
  { product: 'Ciruela', availability: 'Alta', season: 'Cosecha de Ene a Mar' },
  { product: 'Manzana (Red Delicious)', availability: 'Media', season: 'Cosecha de Feb a Abr, luego de cámara' },
  { product: 'Pimiento', availability: 'Alta', season: 'Cosecha de verano, de Dic a Mar' },
  { product: 'Zapallo', availability: 'Alta', season: 'Cosecha de verano y otoño' },
  { product: 'Cereza', availability: 'Baja', season: 'Cosecha muy corta (Nov a Dic)' },
  { product: 'Frutilla', availability: 'Baja', season: 'Principalmente primavera' },
  { product: 'Espárrago', availability: 'Baja', season: 'Cosecha de primavera (Sep-Oct)' },
  { product: 'Banana', availability: 'Importado', season: 'Importada todo el año' },
  { product: 'Palta', availability: 'Importado', season: 'Principalmente importada' },
];
