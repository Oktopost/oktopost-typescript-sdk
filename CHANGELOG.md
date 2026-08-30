# Changelog

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
