# Oktopost Node.js SDK

Official Node.js/TypeScript SDK for the [Oktopost API v2](https://developers.oktopost.com).

## Installation

```bash
npm install oktopost
```

## Requirements

- Node.js 18 or later
- An Oktopost account with API access

## Quick Start

```typescript
import { Oktopost } from 'oktopost';

const client = new Oktopost({
  accountId: process.env.OKTOPOST_ACCOUNT_ID!,
  apiKey: process.env.OKTOPOST_API_KEY!,
});

const campaigns = await client.publishing.campaigns.list({ status: 'active' });
console.log(campaigns.Items);
```

## Configuration

```typescript
const client = new Oktopost({
  accountId: 'your-account-id',
  apiKey: 'your-api-key',
  region: 'us',           // 'us' (default) or 'eu'
  baseUrl: undefined,      // Override base URL for testing
  timeout: 30_000,         // Request timeout in ms (default: 30s)
  maxRetries: 3,           // Max retry attempts (default: 3)
  fetch: customFetch,      // Custom fetch implementation
  onRequest: (info) => {}, // Debug hook: called before each request
  onResponse: (info) => {},// Debug hook: called after each response
});
```

## API Namespaces

The SDK mirrors the Oktopost API documentation structure:

| Namespace | Access | Resources |
|-----------|--------|-----------|
| **Account** | `client.account` | users, teams, teamEntities, socialProfiles, cnames, conversionTags, notifications |
| **Publishing** | `client.publishing` | campaigns, messages, posts, postLog, calendar (+ `calendar.customEvents`), tags, links |
| **Media** | `client.media` | media, uploads, folders |
| **Analytics** | `client.analytics` | postAnalytics, followers, clicks, exports, dashboards |
| **Inbox** | `client.inbox` | comments, conversations, conversationTags, cannedResponses |
| **Advocacy** | `client.advocacy` | advocates, boards, stories, boardMessages, topics |
| **Approvals** | `client.approvals` | workflows, workflowSteps, workflowItems, workflowItemNotes |
| **Streams** | `client.streams` | tabs, streams |
| **Leads** | `client.leads` | leads, activities, links |
| **Events** | `client.events` | webhooks, webhookLog |

> Note: `client.publishing.media` and `client.publishing.uploads` are deprecated aliases of `client.media.media` and `client.media.uploads`. Prefer the `client.media` namespace.

## Pagination

Three ways to handle paginated endpoints:

```typescript
// 1. Manual pagination
const page = await client.publishing.campaigns.list({ _page: 0, _count: 100 });
console.log(page.Items, page.Total);

// 2. AsyncIterator - streams items one by one
for await (const campaign of client.publishing.campaigns.listAll()) {
  console.log(campaign.Id);
}

// 3. Collect all into an array
import { collectAll } from 'oktopost';
const allCampaigns = await collectAll(client.publishing.campaigns.listAll());
```

## Error Handling

```typescript
import {
  OktopostApiError,
  OktopostAuthError,
  OktopostRateLimitError,
  OktopostNotFoundError,
  OktopostPermissionError,
  OktopostTimeoutError,
} from 'oktopost';

try {
  await client.publishing.campaigns.get('invalid-id');
} catch (err) {
  if (err instanceof OktopostNotFoundError) {
    console.log('Campaign not found');
  } else if (err instanceof OktopostAuthError) {
    console.log('Invalid credentials');
  } else if (err instanceof OktopostRateLimitError) {
    console.log('Rate limited, retry after cooldown');
  } else if (err instanceof OktopostApiError) {
    console.log('API error:', err.message, err.errors);
  }
}
```

## Webhooks

Webhook signature verification uses a separate entry point to keep `node:crypto` out of the main bundle:

```typescript
import { verifyWebhookSignature, constructEvent } from 'oktopost/webhooks';

// Verify signature
const isValid = verifyWebhookSignature(rawBody, signature, secret);

// Or verify + parse in one step
const event = constructEvent(rawBody, signature, secret);
console.log(event.event, event.data);
```

## Retry & Rate Limiting

The SDK includes built-in retry logic and proactive rate limiting:

- **Retries**: Automatically retries on 429 (rate limit) and 5xx (server errors) with exponential backoff
- **Never retries**: 400, 401, 403, 404 (client errors)
- **Rate limiting**: Proactively delays requests at 85% of burst limits to prevent the 15-minute lockout

## TypeScript

All types are exported from the main package:

```typescript
import { Oktopost, type Campaign, type Post, type User, type Network } from 'oktopost';
```

## License

MIT
