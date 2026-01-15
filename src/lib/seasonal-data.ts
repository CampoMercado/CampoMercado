export type SeasonalEntry = {
  product: string;
  availability: 'Alta' | 'Media' | 'Baja' | 'Importado';
  season: string; // Ej. "Enero a Marzo", "Todo el año"
};

// Datos representativos para la temporada actual en Mendoza, Argentina.
// Esta información se actualizaría periódicamente.
export const seasonalData: SeasonalEntry[] = [
  // Hortalizas de hoja y tallo
  { product: 'Acelga', availability: 'Alta', season: 'Todo el año, picos en primavera y otoño' },
  { product: 'Lechuga', availability: 'Alta', season: 'Todo el año, con variedades de estación' },
  { product: 'Espinaca', availability: 'Alta', season: 'Principalmente otoño e invierno' },
  { product: 'Apio', availability: 'Media', season: 'Otoño e invierno' },
  { product: 'Espárrago', availability: 'Baja', season: 'Cosecha de primavera (Sep-Oct)' },
  
  // Hortalizas de fruto
  { product: 'Tomate (Redondo/Perita)', availability: 'Alta', season: 'Plena cosecha de Dic a Abr' },
  { product: 'Pimiento (Morrón)', availability: 'Alta', season: 'Cosecha de verano (Dic a Mar)' },
  { product: 'Berenjena', availability: 'Alta', season: 'Verano' },
  { product: 'Zapallo (Anco/Inglés)', availability: 'Alta', season: 'Cosecha de verano y otoño, disponible todo el año' },
  { product: 'Zucchini', availability: 'Alta', season: 'Verano' },
  { product: 'Pepino', availability: 'Media', season: 'Verano' },
  { product: 'Choclo', availability: 'Alta', season: 'Verano (Ene-Feb)' },

  // Hortalizas de raíz, bulbo y tubérculo
  { product: 'Ajo', availability: 'Alta', season: 'Cosecha principal de Nov a Ene' },
  { product: 'Cebolla', availability: 'Alta', season: 'Todo el año' },
  { product: 'Papa', availability: 'Alta', season: 'Todo el año (diferentes variedades)' },
  { product: 'Zanahoria', availability: 'Alta', season: 'Todo el año' },
  { product: 'Remolacha', availability: 'Alta', season: 'Todo el año' },
  { product: 'Batata (Camote)', availability: 'Alta', season: 'Cosecha de otoño, disponible casi todo el año' },
  { product: 'Rabanito', availability: 'Media', season: 'Primavera y otoño' },

  // Frutas de carozo
  { product: 'Cereza', availability: 'Baja', season: 'Cosecha muy corta (Nov a Dic)' },
  { product: 'Damasco', availability: 'Alta', season: 'Cosecha de verano (Dic-Ene)' },
  { product: 'Durazno', availability: 'Alta', season: 'Cosecha de Dic a Feb' },
  { product: 'Ciruela', availability: 'Alta', season: 'Cosecha de Ene a Mar' },

  // Frutas de pepita
  { product: 'Manzana (Red/Granny)', availability: 'Media', season: 'Cosecha de Feb a Abr, luego de cámara' },
  { product: 'Pera (Williams/Packham)', availability: 'Alta', season: 'Cosecha de Ene a Mar, luego de cámara' },
  { product: 'Membrillo', availability: 'Alta', season: 'Otoño (Mar-May)' },

  // Berries y uvas
  { product: 'Uva de Mesa', availability: 'Alta', season: 'Cosecha de Ene a Abr' },
  { product: 'Frutilla', availability: 'Baja', season: 'Principalmente primavera' },
  { product: 'Frambuesa', availability: 'Baja', season: 'Verano' },
  
  // Melones y sandías
  { product: 'Melón', availability: 'Alta', season: 'Verano (Ene-Feb)' },
  { product: 'Sandía', availability: 'Alta', season: 'Verano (Dic-Feb)' },

  // Importados o de otras regiones
  { product: 'Banana', availability: 'Importado', season: 'Importada todo el año' },
  { product: 'Palta', availability: 'Importado', season: 'Principalmente importada del norte' },
  { product: 'Limón', availability: 'Media', season: 'Producido en otras regiones, disponible todo el año' },
  { product: 'Naranja', availability: 'Media', season: 'Producido en otras regiones, disponible todo el año' },
];
