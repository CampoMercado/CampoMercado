export type SeasonalData = {
  abundant: {
    title: string;
    description: string;
    products: string[];
  };
  scarce: {
    title: string;
    description: string;
    products: string[];
  };
  imported: {
    title: string;
    description: string;
    products: string[];
  };
};

// Datos representativos para la temporada actual en Mendoza, Argentina.
// Esta información se actualizaría periódicamente (ej. mensualmente).
export const seasonalData: SeasonalData = {
  abundant: {
    title: 'En Abundancia (Plena Cosecha)',
    description: 'Estos productos están en su pico de cosecha en Mendoza, lo que generalmente significa mayor disponibilidad y mejores precios.',
    products: [
      'Uva (variedades de mesa)',
      'Durazno',
      'Ciruela',
      'Tomate (Redondo y Perita)',
      'Pimiento',
      'Zapallo (varios tipos)',
      'Ajo',
    ],
  },
  scarce: {
    title: 'En Escasez (Fuera de Temporada)',
    description: 'La cosecha de estos productos ha finalizado o es muy limitada. Su disponibilidad es baja y los precios tienden a ser más altos.',
    products: [
      'Cereza',
      'Frutilla',
      'Espárrago',
      'Alcaucil',
      'Habas frescas',
    ],
  },
  imported: {
    title: 'Productos Importados',
    description: 'Estos productos no se cultivan a gran escala en la región o provienen de otras zonas geográficas para satisfacer la demanda.',
    products: [
      'Banana (Ecuador/Bolivia)',
      'Palta (Chile/Perú)',
      'Ananá',
      'Mango',
      'Maracuyá',
    ],
  },
};
