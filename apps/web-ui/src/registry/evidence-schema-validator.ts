import { getEvidenceSchemaItems } from './evidence-schema-registry';
import type { EvidenceSchemaItem } from './evidence-schema-registry';

export interface EvidenceSchemaValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

const FORBIDDEN_TOKEN_PATTERNS = ['token', 'apiKey', 'api_key', 'apikey', 'password', 'passwd', 'privateKey', 'private_key', 'secret', 'credential'];

function hasForbiddenTokenPhrase(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_TOKEN_PATTERNS.some(p => lower.includes(p));
}

export function validateEvidenceSchema(): EvidenceSchemaValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];
  const items = getEvidenceSchemaItems();

  for (const item of items) {
    if (item.writeNow) {
      blocking.push(`${item.id}: writeNow must be false (evidence schema is read-only preview)`);
    }

    if (item.containsSecretMaterial && item.allowedNow) {
      blocking.push(`${item.id}: containsSecretMaterial=true but allowedNow=true — forbidden`);
    }
    if (item.containsSecretMaterial && item.captureNow) {
      blocking.push(`${item.id}: containsSecretMaterial=true but captureNow=true — forbidden`);
    }
    if (item.containsSecretMaterial && item.writeNow) {
      blocking.push(`${item.id}: containsSecretMaterial=true but writeNow=true — forbidden`);
    }

    if (item.containsTokenLikeMaterial && item.allowedNow) {
      blocking.push(`${item.id}: containsTokenLikeMaterial=true but allowedNow=true — forbidden`);
    }
    if (item.containsTokenLikeMaterial && item.captureNow) {
      blocking.push(`${item.id}: containsTokenLikeMaterial=true but captureNow=true — forbidden`);
    }
    if (item.containsTokenLikeMaterial && item.writeNow) {
      blocking.push(`${item.id}: containsTokenLikeMaterial=true but writeNow=true — forbidden`);
    }

    if (item.sensitivity === 'forbidden_secret' && item.allowedNow) {
      blocking.push(`${item.id}: sensitivity=forbidden_secret but allowedNow=true — forbidden`);
    }

    if (item.retention === 'forbidden_no_store' && item.writeNow) {
      blocking.push(`${item.id}: retention=forbidden_no_store but writeNow=true — forbidden`);
    }

    if (item.requiresDbWrite && item.writeNow) {
      blocking.push(`${item.id}: requiresDbWrite=true but writeNow=true — forbidden`);
    }

    if (item.requiresStageC && item.allowedNow) {
      blocking.push(`${item.id}: requiresStageC=true but allowedNow=true — forbidden`);
    }

    if (item.risk === 'critical' && item.allowedNow) {
      blocking.push(`${item.id}: risk=critical but allowedNow=true — forbidden`);
    }

    if (item.sensitivity === 'redacted_sensitive' && !item.requiresRedaction) {
      blocking.push(`${item.id}: sensitivity=redacted_sensitive but requiresRedaction=false — redaction required`);
    }

    if (!item.allowedFields || item.allowedFields.length === 0) {
      if (item.sensitivity !== 'forbidden_secret') {
        warning.push(`${item.id}: allowedFields is empty — consider documenting allowed fields`);
      }
    }

    if (!item.forbiddenFields || item.forbiddenFields.length === 0) {
      warning.push(`${item.id}: forbiddenFields is empty — consider documenting forbidden fields`);
    }

    if (!item.reason) {
      blocking.push(`${item.id}: reason is required but empty`);
    }
    if (!item.nextAction) {
      blocking.push(`${item.id}: nextAction is required but empty`);
    }

    if (item.risk === 'high' || item.risk === 'critical') {
      if (!item.gates || item.gates.length === 0) {
        blocking.push(`${item.id}: risk=${item.risk} but gates is empty — high/critical items must have gates`);
      }
      if (!item.blockedActions || item.blockedActions.length === 0) {
        blocking.push(`${item.id}: risk=${item.risk} but blockedActions is empty — high/critical items must have blockedActions`);
      }
    }

    if (item.requiresRedaction && (!item.redactionRules || item.redactionRules.length === 0)) {
      warning.push(`${item.id}: requiresRedaction=true but redactionRules is empty`);
    }

    if (item.containsTokenLikeMaterial && !item.blockedActions.includes('no_token_api_key_capture')) {
      info.push(`${item.id}: containsTokenLikeMaterial=true — verify blockedActions covers token/API key capture`);
    }
  }

  const allFields = items.flatMap(i => [...i.allowedFields, ...i.forbiddenFields, ...i.redactionRules, i.reason, i.nextAction, ...i.gates, ...i.blockedActions].join(' '));
  const allText = allFields.join(' ');
  const tokenInAllowedFields = items.some(i => i.allowedFields.some(f => hasForbiddenTokenPhrase(f)));
  const tokenInForbiddenFields = items.some(i => i.forbiddenFields.some(f => hasForbiddenTokenPhrase(f)));
  const tokenInGates = items.some(i => i.gates.some(g => hasForbiddenTokenPhrase(g)));
  const docsForbiddenMatches = items.filter(i =>
    hasForbiddenTokenPhrase(i.reason) || hasForbiddenTokenPhrase(i.nextAction)
  );

  if (tokenInAllowedFields) {
    blocking.push('Token/API key/password/private key pattern found in allowedFields — forbidden');
  }

  if (tokenInForbiddenFields) {
    info.push('Token/API key/password/private key pattern found in forbiddenFields — intentional');
  }

  if (tokenInGates) {
    info.push('Token/API key/password/private key pattern found in gates — verify intent');
  }

  for (const match of docsForbiddenMatches) {
    info.push(`${match.id}: token/API key/password/private key mentioned in reason/nextAction — verify it is documentation reference only`);
  }

  return { blocking, warning, info };
}

export function getEvidenceSchemaValidationSummary(): { blocking: number; warning: number; info: number; pass: boolean } {
  const result = validateEvidenceSchema();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
