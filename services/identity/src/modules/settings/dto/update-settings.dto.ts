export class UpdateSettingsDto {
  userId!: string;
  settings!: Record<string, unknown>;
  contactEmail?: string;
  phoneNumber?: string;
}
