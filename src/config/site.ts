/** Public business information shared by the site's sections. */
export const siteConfig = {
  name: "Primos Lar e Construção",
  description: "Materiais de construção, ferramentas e equipamentos em Sorocaba. Solicite seu orçamento com a Primos Lar e Construção.",
  foundingYear: 1981,
  phone: "(15) 3229-3388",
  whatsappNumber: "551532293388",
  email: "primos@primosmat.com",
  address: "Av. Dr. Armando Pannunzio, 90 - Cerrado, Sorocaba - SP",
  hours: { weekdays: "7h30 às 17h30", saturday: "8h00 às 12h30" },
} as const;

export const navigationItems = [
  { href: "#home", label: "HOME" },
  { href: "#sobre", label: "SOBRE NÓS" },
  { href: "#produtos", label: "PRODUTOS" },
  { href: "#contato", label: "CONTATO" },
] as const;
