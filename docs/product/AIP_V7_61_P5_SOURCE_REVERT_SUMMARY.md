# AIP v7.61-P5 Source Revert Summary

**File:** `apps/web-ui/src/pages/GovernanceCenter.tsx`

---

## Changes Made

### 1. React import — removed `useState, useEffect` (line 1)
Restored to `import React, { useMemo } from 'react'`

### 2. Added back validator static import (line 148)
Restored `import { validateGovernanceRegistry, getGovernanceRegistrySummary } from '../registry/governance-registry-validator'`

### 3. Replaced `useState` + `useEffect` + dynamic import with original `useMemo` (lines 371-400)
Restored:
```
const summary = useMemo(() => getGovernanceRegistrySummary(), []);
const validator = useMemo(() => validateGovernanceRegistry(), []);
```

## Lines Changed
- **-30** lines removed (P2 addition removed)
- **+2** lines added (P2 removal restored)
- **Net:** -28 lines (returned to original)

## Files Touched
Only `apps/web-ui/src/pages/GovernanceCenter.tsx`
