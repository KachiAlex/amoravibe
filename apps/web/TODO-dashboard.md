# Dashboard Integration TODOs

1. Restore and wire engagement server actions for likes, nudges, and notification toggles so UI triggers backend mutations.
2. Replace mock discover people cards with live data from backend (temporary bridge: map match candidates until dedicated endpoint ships).
3. Replace placeholder message threads with real inbox data once messaging API is available.
4. Ensure engagement API always returns discover filters, perks, safety resources, and settings shortcuts to avoid static fallbacks.
5. Add telemetry/loading states for discover interactions (like/pass/save) so users get feedback while actions process.
