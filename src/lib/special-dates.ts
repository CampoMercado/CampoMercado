// Fechas representativas para análisis histórico.
// Los precios se buscarán en el día exacto especificado.

type SpecialDate = {
  name: string;
  date: string; // Formato YYYY-MM-DD
};

export const specialDates: SpecialDate[] = [
  {
    name: 'Viernes Santo 2024',
    date: '2024-03-29',
  },
  {
    name: 'Día del Trabajador 2024',
    date: '2024-05-01',
  },
  {
    name: 'Revolución de Mayo 2024',
    date: '2024-05-25',
  },
   {
    name: 'Inicio Invierno 2024',
    date: '2024-06-21',
  },
  {
    name: 'Día de la Independencia 2024',
    date: '2024-07-09',
  },
  {
    name: 'Pico de Invierno 2024',
    date: '2024-07-20',
  }
];
