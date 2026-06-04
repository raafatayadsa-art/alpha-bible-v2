export type SaintEvent = {
  year: string;
  text: string;
};

export type Saint = {
  id: string;
  name: string;
  title: string;
  feast: string;
  gregorianDate: string;
  copticDate: string;
  liturgicalColor: string;
  liturgicalColorHex: string;
  summary: string;
  quote: string;
  quoteRef: string;
  reposeDate: string;
  reposePlace: string;
  service: string;
  commemoration: string;
  bio: string;
  events: SaintEvent[];
  image: string;
};
