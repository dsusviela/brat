# Global Variables Guide

## Quick Start

### 1. Define Variables in Your Scenario

```markdown
---
env: review-env
---

# My Test

## Variables

- review-env=real-server-1234
- user=123

## Steps

- Generate API Bearer Token
- Create Item API
```

### 2. Use Placeholders in Your .env File

```env
# envs/review-env.env
VIRT_API_ENDPOINT=https://{{review-env}}-vi-agent-web.review.example.com/api/v1
USER_ID={{user}}
```

### 3. Access Variables in Blocks

Variables are available in two ways:

**From Context (GLOBAL_* prefix):**
```typescript
const reviewEnv = context.GLOBAL_REVIEW_ENV;  // "real-server-1234"
const user = context.GLOBAL_USER;              // "123"
```

**From Environment (after substitution):**
```typescript
const apiEndpoint = env.VIRT_API_ENDPOINT;  // "https://real-server-1234-vi-agent..."
const userId = env.USER_ID;                  // "123"
```

## Variable Naming

Variable keys are transformed when added to context:
- Converted to uppercase
- Non-alphanumeric characters (dots, hyphens, etc.) become underscores
- Prefixed with `GLOBAL_`

| Variable Key | Context Key |
|--------------|-------------|
| `review-env` | `GLOBAL_REVIEW_ENV` |
| `user` | `GLOBAL_USER` |
| `api.version` | `GLOBAL_API_VERSION` |
| `test_value` | `GLOBAL_TEST_VALUE` |

## Syntax Rules

### Variables Section

- Optional section in scenario files
- Must use `## Variables` heading
- Each variable on separate line starting with `- `
- Format: `key=value`, `key="value"`, or `key='value'`
- Comments start with `#`

Example:
```markdown
## Variables

# Server configuration
- review-env=server-123
- user=456

# API settings
- timeout=5000
```

### Placeholder Substitution

- Use `{{variable-name}}` in .env files
- Placeholders are case-sensitive and must match variable keys exactly
- If a placeholder's variable isn't defined, it remains unchanged
- Multiple occurrences of the same placeholder are all replaced

Example:
```env
API_URL=https://{{server}}-api.example.com/{{version}}
BACKUP_URL=https://{{server}}-backup.example.com/{{version}}
```

## Important Notes

### Required ## Steps Section

**All scenario files must now include a `## Steps` heading** before the step list.

❌ **Old format (no longer works):**
```markdown
# My Scenario

- Generate API Bearer Token
- Create Item API
```

✅ **New format (required):**
```markdown
# My Scenario

## Steps

- Generate API Bearer Token
- Create Item API
```

### Backward Compatibility

Scenarios without a `## Variables` section work normally:

```markdown
---
env: local
---

# Simple Scenario

## Steps

- Generate API Bearer Token
```

No variables are added to context, and no substitution occurs in env files.

## Examples

### Example 1: Basic Usage

**Scenario (scenarios/test.md):**
```markdown
---
env: review
---

# Review Environment Test

## Variables

- review-env=pr-12345

## Steps

- Generate API Bearer Token
- Create Item API
```

**Environment (envs/review.env):**
```env
API_ENDPOINT=https://{{review-env}}-api.example.com
```

**Result:**
- Context: `{ GLOBAL_REVIEW_ENV: "pr-12345" }`
- Environment: `{ API_ENDPOINT: "https://pr-12345-api.example.com" }`

### Example 2: Multiple Variables

**Scenario:**
```markdown
## Variables

- server=test-env-999
- user=alice
- api-version=v2
- timeout=10000
```

**Environment file:**
```env
API_URL=https://{{server}}.example.com/{{api-version}}
USER_ID={{user}}
REQUEST_TIMEOUT={{timeout}}
```

**Result in Context:**
```javascript
{
  GLOBAL_SERVER: "test-env-999",
  GLOBAL_USER: "alice",
  GLOBAL_API_VERSION: "v2",
  GLOBAL_TIMEOUT: "10000"
}
```

**Result in Environment:**
```javascript
{
  API_URL: "https://test-env-999.example.com/v2",
  USER_ID: "alice",
  REQUEST_TIMEOUT: "10000"
}
```

### Example 3: Variable Not Found

**Scenario:**
```markdown
## Variables

- server=test-123
```

**Environment file:**
```env
API_URL=https://{{server}}.example.com
BACKUP_URL=https://{{backup-server}}.example.com
```

**Result:**
```javascript
{
  API_URL: "https://test-123.example.com",
  BACKUP_URL: "https://{{backup-server}}.example.com"  // Not substituted
}
```

## Troubleshooting

### "Scenario file must contain a '## Steps' section"

**Solution:** Add `## Steps` heading before your step list.

### Variables not being substituted

**Check:**
1. Placeholder syntax: Must be `{{variable-name}}` (double curly braces)
2. Variable key matches exactly (case-sensitive)
3. Variable is defined in `## Variables` section

### Duplicate variable warnings

If you see: `Duplicate variable "xyz" (using first value)`

**Solution:** Remove duplicate variable definitions. Only the first occurrence is used.

### Variable value has quotes

Variables support quoted values:
```markdown
- message="Hello, World!"
- path='/usr/local/bin'
```

Quotes are automatically removed from the value.
