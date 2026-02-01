# Home Feed API

This document specifies the API contract for the Home feed used by `apps/web` Dashboard Home tab.

## GET /api/dashboard/home

Query parameters:

- `userId` (required): string
- `page` (optional): number (default 1)
- `limit` (optional): number (default 12)
- `mode` (optional): `default|verified|nearby|fresh|premium|shared`

Response (200):

```json
{
  "hero": null,
  "featured": [],
  "grid": [],
  "filters": [],
  "total": 0,
  "mode": "default",
  "generatedAt": "2026-02-01T12:00:00.000Z"
}
```

Fields:

- `hero`: single `DiscoverCard` or `null`.
- `featured`: array of `DiscoverCard` items to highlight.
- `grid`: array of `DiscoverCard` items for the main feed.
- `filters`: array of filter metadata (label/value/premium/active).
- `total`: total available items.
- `mode`: discover mode used to produce the feed.
- `generatedAt`: ISO timestamp of feed generation.

### DiscoverCard example

```json
{
  "id": "user-abc123",
  "name": "Alex",
  "age": 28,
  "city": "San Francisco",
  "cityRegion": "CA",
  "distance": "2 km",
  "distanceKm": 2,
  "tags": ["Coffee shops", "Film festivals"],
  "image": "https://.../photo.jpg",
  "compatibility": 87,
  "verified": false,
  "premiumOnly": false,
  "receiverId": "user-abc123",
  "actionable": true
}
```

## GET /api/trust/snapshot?userId={userId}

Returns a trust snapshot used by the dashboard's profile & trust sections.

Response example:

```json
{
  "devices": [],
  "user": {
    "id": "user-abc123",
    "displayName": "You",
    "isVerified": false,
    "trustScore": 42,
    "photos": []
  }
}
```

## POST /api/user/action

Used for ephemeral actions (like/save/pass).
Request body (JSON):

```json
{
  "senderId": "user-abc123",
  "receiverId": "user-def456",
  "action": "like|superlike|pass|save|dismiss",
  "highlight": "optional text"
}
```

Response (200):

```json
{ "success": true }
```

## POST /api/telemetry/impression

Used to batch impressions for feed items.
Request body (JSON):

```json
{
  "userId": "user-abc123",
  "impressions": [{ "itemId": "user-def456", "visibleMs": 1200 }]
}
```

Response (200): `{ "success": true }`

## Error handling

- 400: invalid params
- 401: unauthorized
- 429: rate limit
- 500: internal server error

Notes

- API must return stable `id` fields.
- Feed items should include `compatibility` or another ranking metric for client use.
- Keep PII minimal in feed responses. Telemetry should avoid sensitive data.
