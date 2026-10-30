import { z } from "zod";
const text = (max = 200) =>
  z.string().trim().min(1, "Campo obrigatório").max(max);
export const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) => /^\/(?!\/)[^\\\s]*$/.test(v) || /^https:\/\/[^\s\\]+$/.test(v),
    "Use um caminho local ou URL HTTPS",
  );
const optionalLink = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) =>
      !v ||
      /^#[\w-]+$/.test(v) ||
      /^\/(?!\/)[^\\\s]*$/.test(v) ||
      /^https:\/\/[^\s\\]+$/.test(v),
    "Link inválido: use HTTPS, /caminho ou #seção",
  );
const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Cor deve estar em formato #RRGGBB");
export const categorySchema = z
  .object({
    name: text(80),
    slug: text(80).regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use letras minúsculas, números e hífens",
    ),
    primaryColor: color,
    secondaryColor: color,
  })
  .strict();
export const productSchema = z
  .object({
    name: text(160),
    description: text(3000),
    imageUrl: z
      .union([imageUrl, z.literal(""), z.null()])
      .transform((v) => v || null),
    published: z.boolean(),
    categoryId: text(100),
  })
  .strict();
export const bannerSchema = z
  .object({
    title: text(160),
    imageUrl,
    linkUrl: optionalLink,
    position: z.number().int().min(0).max(9999),
    published: z.boolean(),
  })
  .strict();
export const settingsSchema = z
  .object({
    name: text(120),
    description: text(320),
    primaryColor: color,
    secondaryColor: color,
    logoUrl: imageUrl,
    phone: text(40),
    whatsappNumber: z
      .string()
      .regex(/^\d{10,15}$/, "Use DDI e número, somente dígitos"),
    email: z.email().max(254),
    address: text(300),
    weekdays: text(80),
    saturday: text(80),
    heroTitle: text(180),
    heroText: text(600),
    heroButton: text(80),
    newsTitle: text(180),
    newsLabel: text(180),
    newsText: text(4000),
    newsImage: imageUrl,
    newsEnabled: z.boolean(),
    aboutTitle: text(180),
    aboutText: text(4000),
    aboutImage: imageUrl,
    aboutEnabled: z.boolean(),
    catalogTitle: text(180),
    catalogText: text(600),
    contactTitle: text(180),
    contactText: text(600),
    footerText: text(400),
  })
  .strict();
export const loginSchema = z
  .object({ email: z.email().max(254), password: z.string().min(1).max(256) })
  .strict();
