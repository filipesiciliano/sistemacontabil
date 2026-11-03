import { z } from 'zod';

export const CompanyIdSchema = z.uuid().brand<'CompanyId'>();
export type CompanyId = z.infer<typeof CompanyIdSchema>;

export const EstablishmentIdSchema = z.uuid().brand<'EstablishmentId'>();
export type EstablishmentId = z.infer<typeof EstablishmentIdSchema>;

export const UserIdSchema = z.uuid().brand<'UserId'>();
export type UserId = z.infer<typeof UserIdSchema>;
