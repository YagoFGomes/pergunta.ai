import * as z from 'zod';

const registerBaseSchema = z.object({
  email: z.email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password')
});

export const registerStepSchema = registerBaseSchema.refine(
  (data) => data.password === data.confirm_password,
  { message: 'Passwords do not match', path: ['confirm_password'] }
);

/** Individual field schemas for onBlur validation */
export const registerFieldSchemas = registerBaseSchema.shape;

export const onboardingStepSchema = z.object({
  name: z.string().optional(),
  domain: z.string().optional()
});

export type RegisterStepValues = z.infer<typeof registerBaseSchema>;
export type OnboardingStepValues = z.infer<typeof onboardingStepSchema>;
