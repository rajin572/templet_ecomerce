import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_SALT_ROUNDS: z.string().default('12'),
  OTP_EXPIRES_IN: z.string().default('5'),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string(),
  CLIENT_URLS: z.string(),
  SMS_API_KEY: z.string().optional(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('❌ Invalid environment variables:', envVars.error.format());
  process.exit(1);
}

export const config = {
  env: envVars.data.NODE_ENV,
  port: parseInt(envVars.data.PORT, 10),
  databaseUrl: envVars.data.DATABASE_URL,
  jwt: {
    accessSecret: envVars.data.JWT_ACCESS_SECRET,
    accessExpiresIn: envVars.data.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: envVars.data.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.data.JWT_REFRESH_EXPIRES_IN,
  },
  bcryptSaltRounds: parseInt(envVars.data.BCRYPT_SALT_ROUNDS, 10),
  otpExpiresIn: parseInt(envVars.data.OTP_EXPIRES_IN, 10),
  cloudinary: {
    cloudName: envVars.data.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.data.CLOUDINARY_API_KEY,
    apiSecret: envVars.data.CLOUDINARY_API_SECRET,
  },
  email: {
    user: envVars.data.EMAIL_USER,
    pass: envVars.data.EMAIL_PASS,
  },
  clientUrls: envVars.data.CLIENT_URLS.split(','),
  smsApiKey: envVars.data.SMS_API_KEY,
};
