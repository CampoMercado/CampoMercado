// Fechas representativas para análisis histórico.
// Los precios se buscarán en el día exacto especificado.

type SpecialDate = {
  name: string;
  date: string; // Formato YYYY-MM-DD
};

export const specialDates: SpecialDate[] = [
  {
    name: 'Viernes Santo 2026',
    date: '2026-04-03',
  },
  {
    name: 'Día del Trabajador 2026',
    date: '2026-05-01',
  },
  {
    name: 'Revolución de Mayo 2026',
    date: '2026-05-25',
  },
   {
    name: 'Inicio Invierno 2026',
    date: '2026-06-21',
  },
  {
    name: 'Día de la Independencia 2026',
    date: '2026-07-09',
  },
  {
    name: 'Pico de Invierno 2026',
    date: '2026-07-20',
  }
];
