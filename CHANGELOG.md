# Changelog

## 1.2.0

Rate limits: honor `Retry-After` and say which limit was hit.

### Added

- `OktopostRateLimitError.limit` (`'user'` for the per-user API plan limit, `'burst'` for a short block after too many calls) and `OktopostRateLimitError.retryAfter` (seconds, from the `Retry-After` header).
- `maxRateLimitWaitMs` client option (default 60 s): the longest `Retry-After` the SDK waits before a retry.
- Exported types `OktopostApiErrors`, `OktopostRateLimitKind`, `OktopostRateLimitErrorOptions`.

### Changed

- **Breaking**: A rate limit no longer sleeps a flat 15 minutes per retry. The SDK waits for `Retry-After` up to `maxRateLimitWaitMs`; a longer wait, or a burst block without `Retry-After`, throws `OktopostRateLimitError` at once.
- **Breaking**: The per-user plan limit (`Errors.API.RateLimit`, which the API answers today with a status other than 429) throws `OktopostRateLimitError` (`limit: 'user'`, `statusCode` of the response) instead of `OktopostApiError` "Unknown API error", and is retried with backoff.
- **Breaking**: `OktopostRateLimitError` extends `OktopostApiError` (it still extends `OktopostError`) and carries the response's `Errors`; a 429 keeps the body's message. Code that checks `instanceof OktopostApiError` before `instanceof OktopostRateLimitError` now sends rate limits down the first branch: check `OktopostRateLimitError` first.
- `Retry-After` is read as delta-seconds or an HTTP date (IMF-fixdate); any other value is ignored.
- The built-in throttle counts a request when it is sent, so parallel requests are counted, and follows the documented limits (60 per second, 120 per 5 seconds, at 85%) instead of 51 per minute.
- `OktopostApiError` without `Errors.API.Error` takes its message from the first field error instead of "Unknown API error".
- `OktopostApiError.errors` is typed `OktopostApiErrors` (`Record<string, Record<string, string>>`), so codes other than `Error`, such as `API.RateLimit`, type-check.

## 1.1.0

Brings the SDK to parity with Oktopost API v2.18.0.

### Added

- **Inbox**: `client.inbox.conversations` (list, get, updateStatus, getTimeline, assign, addNote, updateTags, reply, createSalesforceCase), `client.inbox.conversationTags` (list, get, update, delete), and `client.inbox.cannedResponses` (list, get, create).
- **Media namespace**: new `client.media` grouping `media`, `uploads`, and a new `folders` resource (list, get, create, rename, delete). `client.publishing.media` and `client.publishing.uploads` remain as deprecated aliases.
- **Analytics**: `client.analytics.dashboards` (list, get, getReportData) for Social BI dashboards.
- **Publishing**: `client.publishing.posts.changeCampaign()` to move a post to another campaign; `client.publishing.calendar.customEvents` sub-resource (list, get, create, update, delete) for custom calendar events; `targetingPresetId` on create/update post; `workflowId` on create post (create-only); nested `firstComment` object (`{ text?, media? }`, or `null` on update to remove) for LinkedIn first comments; `FirstComment` on post responses.
- **Account**: `client.account.socialProfiles.listTargetingPresets()` for LinkedIn audience targeting presets; `q` name-search and pagination/sorting params on `client.account.users.list()`.
- **Advocacy**: `client.advocacy.advocates.bulkInvite()` (up to 100 entries with partial `Errors`); `boardId`, `lastSeen`, `notSeen`, `neverSeen`, and pagination filters on advocate list, plus board-scoped list fields (`Shares`, `LastSeen`, `Role`, `RoleId`, `CustomFields`, `Leaderboards`); `postlogId` on story create for LinkedIn repost stories.
- **Leads**: `all_leads` parameter on lead list; `PostlogId` on lead activities.
- **Media types**: `PDF` added to the media type filter and supported upload MIME types.
- **Webhooks**: new inbox engagement event types (`newInboxItem`, `newCommentOnInboxItem`, `newDirectMessageOnInboxItem`, `inboxItemReplied`, `newNoteOnInboxItem`, `newInboxItemAssignment`, `inboxItemStatusChange`, `inboxItemTagChange`).

### Changed

- `client.advocacy.advocates.invite()` now returns the API's `Users` response shape (while retaining the base `Errors` field for backward compatibility) and supports re-invite via `userId` plus optional `message`/`role`/`customFields`. Invite params are now an exclusive union: a new invite requires `email` + `firstName` + `lastName`, a re-invite requires `userId`, and the two are mutually exclusive (also applied to `bulkInvite` entries).
- **Breaking**: `client.advocacy.stories.create()` and `.update()` now resolve to the created/updated `Story` (the response `Item`) instead of the raw `BaseApiResponse`. `create()` accepts a discriminated union of a normal story vs. a LinkedIn repost (`postlogId` + optional `generateMessages`), and `Story.Title` is now nullable.
- `client.publishing.calendar.customEvents.update()` now sends an explicit empty value for `campaignIds: []` so an event's campaigns can be cleared (previously an empty array was dropped and treated as "unchanged").
- `client.account.socialProfiles.listTargetingPresets()` now accepts any `_count` from 1 to 100 (previously restricted to 25/50/100).
- Array and nested-object request params are now encoded with PHP-style bracket notation (`ids[]=a`, `users[0][email]=x`, `firstComment[text]=y`) in both query strings and form bodies, matching the API. Calendar `filters` continues to be sent as a JSON string.

## 1.0.0

Initial release of the Oktopost Node.js SDK.

### Features

- Full coverage of the Oktopost API v2 across 9 namespaces (37 resource classes)
- Namespace-based API design: `client.publishing.campaigns.list()`
- Auto-pagination with AsyncIterator (`listAll()`) and `collectAll()` utility
- Built-in retry with exponential backoff for 429 and 5xx errors
- Proactive rate limiting to prevent 15-minute lockouts
- Webhook signature verification via separate `oktopost/webhooks` entry point
- Full TypeScript support with exported types for all resources
- Zero runtime dependencies (uses Node.js built-in `fetch` and `node:crypto`)
- Dual ESM/CJS package output
- Debug hooks (`onRequest`/`onResponse`) for logging and monitoring
- US and EU region support
