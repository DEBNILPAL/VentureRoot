import { z } from "zod";

console.log("ENV TEST:", {
  NODE_ENV: process.env.NODE_ENV,
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  API_PREFIX: process.env.API_PREFIX,
  DIRECT_URL: process.env.DIRECT_URL ? "exists" : "missing",
});

console.log("CWD:", process.cwd());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  APP_NAME: z.string().min(1).default("VentureRoot Backend"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_PREFIX: z.string().startsWith("/").default("/api/v1"),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  DIRECT_URL: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.warn("!! Warning: Environment configuration issues detected:");
  console.warn(parsedEnv.error.flatten().fieldErrors);
}

const env = {
  nodeEnv: parsedEnv.data?.NODE_ENV || process.env.NODE_ENV || "production",
  appName: parsedEnv.data?.APP_NAME || process.env.APP_NAME || "VentureRoot Backend",
  appUrl: parsedEnv.data?.APP_URL || process.env.APP_URL || "http://localhost:3000",
  apiPrefix: parsedEnv.data?.API_PREFIX || process.env.API_PREFIX || "/api/v1",

  supabaseUrl:
    parsedEnv.data?.SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://enuunerxfbjogupaegdm.supabase.co",
  supabasePublishableKey:
    parsedEnv.data?.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_lWjGzbxyvgWQTcUihcd5Pg_aDySsf6b",

  directUrl: parsedEnv.data?.DIRECT_URL || process.env.DIRECT_URL || "",
};

export default env;