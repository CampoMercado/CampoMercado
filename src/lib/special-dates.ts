// Fechas representativas para análisis histórico.
// Los precios se buscarán en el día exacto especificado.

type SpecialDate = {
  name: string;
  date: string; // Formato YYYY-MM-DD
};

export const specialDates: SpecialDate[] = [
  {
    name: 'Navidad 2023',
    date: '2023-12-24',
  },
  {
    name: 'Año Nuevo 2024',
    date: '2023-12-31',
  },
  {
    name: 'Semana Santa 2024',
    date: '2024-03-29', // Viernes Santo
  },
  {
    name: 'Día del Trabajador 2024',
    date: '2024-05-01',
  },
   {
    name: 'Inicio Invierno 2024',
    date: '2024-06-21',
  },
  {
    name: 'Día de la Independencia',
    date: '2024-07-09',
  }
];
