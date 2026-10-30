import { z } from "zod";
export const salesTimezone = "America/Sao_Paulo";
export const weekdayNames = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm");
export const minutes = (value: string) =>
  Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
const shift = z
  .object({
    day: z.number().int().min(0).max(6),
    enabled: z.boolean(),
    start: time,
    lunch: z.boolean(),
    lunchStart: time,
    lunchEnd: time,
    end: time,
  })
  .strict()
  .superRefine((s, c) => {
    if (!s.enabled) return;
    if (minutes(s.start) >= minutes(s.end))
      c.addIssue({
        code: "custom",
        message: "Entrada deve ser anterior à saída",
      });
    if (
      s.lunch &&
      !(
        minutes(s.start) < minutes(s.lunchStart) &&
        minutes(s.lunchStart) < minutes(s.lunchEnd) &&
        minutes(s.lunchEnd) < minutes(s.end)
      )
    )
      c.addIssue({
        code: "custom",
        message:
          "Almoço deve ficar entre entrada e saída, com retorno após a saída para almoço",
      });
  });
export const scheduleSchema = z
  .array(shift)
  .length(7)
  .refine(
    (s) => new Set(s.map((x) => x.day)).size === 7,
    "Informe uma regra para cada dia da semana",
  );
export type Schedule = z.infer<typeof scheduleSchema>;
export const defaultSchedule: Schedule = weekdayNames.map((_, day) => ({
  day,
  enabled: day >= 1 && day <= 5,
  start: "08:00",
  lunch: true,
  lunchStart: "12:00",
  lunchEnd: "13:00",
  end: "18:00",
}));
export const sellerSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    phone: z
      .string()
      .regex(/^55\d{10,11}$/, "Informe DDI 55, DDD e número, somente dígitos"),
    active: z.boolean(),
    schedule: scheduleSchema,
  })
  .strict();
export const quoteSchema = z
  .object({
    requestKey: z.string().uuid(),
    items: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            quantity: z.number().int().min(1).max(999),
          })
          .strict(),
      )
      .min(1)
      .max(50),
  })
  .strict()
  .refine(
    (x) => new Set(x.items.map((i) => i.id)).size === x.items.length,
    "Produtos repetidos na lista",
  );
export const quoteStatuses = {
  forwarded: "Encaminhado",
  contacted: "Em atendimento",
  completed: "Concluído",
  cancelled: "Cancelado",
};
export const quoteUpdateSchema = z
  .object({
    status: z.enum(["forwarded", "contacted", "completed", "cancelled"]),
    notes: z.string().trim().max(1000),
  })
  .strict();
export function isSellerAvailable(schedule: unknown, now = new Date()) {
  const result = scheduleSchema.safeParse(schedule);
  if (!result.success) return false;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: salesTimezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    get("weekday"),
  );
  const minute = Number(get("hour")) * 60 + Number(get("minute"));
  const shift = result.data.find((s) => s.day === day);
  return (
    !!shift?.enabled &&
    minute >= minutes(shift.start) &&
    minute < minutes(shift.end) &&
    (!shift.lunch ||
      minute < minutes(shift.lunchStart) ||
      minute >= minutes(shift.lunchEnd))
  );
}
