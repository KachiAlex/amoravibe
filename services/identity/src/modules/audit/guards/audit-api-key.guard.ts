import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/config.service';

const normalizeHeader = (value?: string | string[]): string | null => {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
};

@Injectable()
export class AuditApiKeyGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();

    const providedKey = normalizeHeader(request.headers['x-api-key']);
    const expectedKey = this.config.audit.apiKey;

    if (!providedKey || providedKey !== expectedKey) {
      throw new ForbiddenException('Missing or invalid audit API key');
    }

    return true;
  }
}
