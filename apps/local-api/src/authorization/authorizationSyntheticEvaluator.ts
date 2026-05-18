import type { AuthorizationDryRunFixture } from './authorizationDryRunFixtures.js'

export interface SyntheticDecision {
  decision: 'DENY' | 'BLOCKED' | 'OBSERVE_ONLY'
  runtimeAllowed: boolean
  stageCAllowed: boolean
  externalWriteAllowed: boolean
  productionActionAllowed: boolean
  reason: string
  mode: 'synthetic_dry_run'
}

export function evaluateFixture(fixture: AuthorizationDryRunFixture): SyntheticDecision {
  if (fixture.risk_level === 'critical') {
    return {
      decision: 'BLOCKED',
      runtimeAllowed: false,
      stageCAllowed: false,
      externalWriteAllowed: false,
      productionActionAllowed: false,
      reason: `Stage C disabled and production runtime implementation is blocked — critical action "${fixture.requested_action}" on scope "${fixture.requested_scope}" denied by synthetic policy`,
      mode: 'synthetic_dry_run',
    }
  }

  if (fixture.requested_action === 'view' && fixture.risk_level === 'low') {
    return {
      decision: 'OBSERVE_ONLY',
      runtimeAllowed: false,
      stageCAllowed: false,
      externalWriteAllowed: false,
      productionActionAllowed: false,
      reason: 'Safe readonly access — observe only, no runtime execution',
      mode: 'synthetic_dry_run',
    }
  }

  if (fixture.risk_level === 'high') {
    return {
      decision: 'DENY',
      runtimeAllowed: false,
      stageCAllowed: false,
      externalWriteAllowed: false,
      productionActionAllowed: false,
      reason: `High risk action "${fixture.requested_action}" on scope "${fixture.requested_scope}" denied — production runtime implementation is blocked`,
      mode: 'synthetic_dry_run',
    }
  }

  return {
    decision: 'DENY',
    runtimeAllowed: false,
    stageCAllowed: false,
    externalWriteAllowed: false,
    productionActionAllowed: false,
    reason: 'Default deny-by-default synthetic policy — production runtime implementation is blocked',
    mode: 'synthetic_dry_run',
  }
}
