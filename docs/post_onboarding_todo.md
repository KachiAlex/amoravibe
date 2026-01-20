# Post-Onboarding Feature To-Do List

Version 0.1 — guiding implementation immediately after the onboarding flow.

## 1. Profile Completion & Trust Hub

- [ ] Build profile completion dashboard shell (strength meter, checklist, trust badges)
- [ ] Wire profile data service stub + progress calculation
- [ ] Add media manager: upload, reorder, delete
- [ ] Implement verification tasks (selfie/ID placeholders, status states)
- [ ] Surface editable gender/orientation/visibility controls with guardrails

## 2. Discovery & Matching

- [ ] Create discovery layout with separate Straight / LGBTQ tabs
- [ ] Implement filter drawer (distance, age, intent)
- [ ] Integrate preference-aware feed service (mock data first)
- [ ] Add like / skip / save interactions + optimistic UI state
- [ ] Emit mutual match events into match manager service

## 3. Match Management

- [ ] Build match inbox (active / archived views)
- [ ] Add match expiration timer + queued reminders
- [ ] Provide unmatch + block actions with confirmation dialogs
- [ ] Sync match status to messaging eligibility state

## 4. Messaging & Interaction

- [ ] Scaffold chat workspace (thread list + composer)
- [ ] Support text + emoji picker; plan for GIF provider integration
- [ ] Add voice note recording stub (feature flagged)
- [ ] Implement read receipts + delivery states (premium gated)
- [ ] Enforce media sharing controls + report hooks

## 5. Safety, Moderation & Reporting

- [ ] Inline report flow from profile/match/chat contexts
- [ ] Block + hide profile actions (global state)
- [ ] Hook into moderation queue service (stub)
- [ ] Warning + suspension UI states

## 6. Visibility & Boost Features

- [ ] Boost entry point + scheduling modal
- [ ] Super like / priority like buttons + counters
- [ ] "See who liked you" gallery (premium paywall)
- [ ] Advanced filter toggles (feature-flagged)

## 7. Notifications & Engagement

- [ ] Notification center panel (match, message, view alerts)
- [ ] Inactivity nudges + email/push stubs
- [ ] Event/feature announcement banner system

## 8. Account & Preference Management

- [ ] Privacy + visibility settings page
- [ ] Gender/orientation change workflow (review required)
- [ ] Location change / travel mode interface
- [ ] Subscription management + upgrade paths
- [ ] Account pause/delete confirmations

## 9. Admin & Platform Management

- [ ] Admin dashboard shell (user search, verification queue)
- [ ] Reporting & moderation panel views
- [ ] Analytics + growth tracking widgets (tail events)
- [ ] Feature flag + content control interfaces
