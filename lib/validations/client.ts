import { z } from "zod";

export const clientSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cliente."),
  tipo: z.enum(["pf", "pj"]),
  cpf_cnpj: z.string().trim().max(20, "Documento muito longo.").optional(),
  email: z.string().trim().email("Informe um e-mail válido.").optional(),
  telefone: z.string().trim().max(25, "Telefone muito longo.").optional(),
  endereco: z.string().trim().max(200, "Endereço muito longo.").optional(),
  observacoes: z
    .string()
    .trim()
    .max(1000, "Observação muito longa.")
    .optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export type ClientTipo = "pf" | "pj";

export type Client = {
  id: string;
  user_id: string;
  nome: string;
  tipo: ClientTipo;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export const CLIENT_TIPO_LABEL: Record<ClientTipo, string> = {
  pf: "Pessoa física",
  pj: "Pessoa jurídica",
};
