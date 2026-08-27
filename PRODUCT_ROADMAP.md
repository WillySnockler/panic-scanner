# Panic Scanner — Product Roadmap

## Product goal
Build Panic Scanner into a professional market-research workspace that gives users many useful ways to investigate opportunities without promising profits or pretending to provide personalized investment advice.

## Baseline rule
Keep the current working production UI as the visual baseline. Do not replace it with a new design unless explicitly requested. Major feature work should extend the existing UX cleanly.

## Core navigation
- Dashboard
- Watchlist
- Opportunities
- Setup Planner
- Investigations
- Plans & Subscriptions
- Settings
- Account

## Opportunity discovery
- Search a stock or company
- Opportunity scanner with configurable filters
- Oversold / recovery candidates
- Momentum / breakout candidates
- Unusual-volume candidates
- News-driven candidates
- Catalyst-driven candidates
- Technical + fundamental confluence
- Risk level on every opportunity
- Clear evidence and rationale for every signal

## Trade Setup Planner
A planning tool, not an automatic trading system.

Inputs:
- Stock/ticker
- Capital / position amount
- Entry price or entry zone
- Stop-loss / stop-limit level
- Target price or target zone
- Risk percentage
- Optional thesis/notes

Calculated outputs:
- Units/shares
- Maximum loss
- Potential gain
- Risk/reward ratio
- Upside/downside percentages
- Position exposure

Risk profiles:
- Conservative / Safe
- Balanced / Medium
- Aggressive / Risky

Risk profiles must change the proposed setup using observable technical structure, volatility and invalidation levels. Never move a stop simply to manufacture a better-looking profit scenario.

Every setup must explain:
- What the setup is looking for
- Why entry/stop/target areas were selected
- What would confirm the thesis
- What would invalidate it
- Potential upside/downside
- Important risks

Plan limits:
- Standard: 1 saved setup
- Pro: limited active/saved setups (initial target: 5–10, configurable)
- Elite: unlimited setups

## Scenario Simulator
- Compare conservative / medium / aggressive scenarios
- Adjust entry, stop, target and position size
- Instantly recalculate gain/loss and risk/reward
- Show assumptions clearly
- Never present scenarios as guaranteed outcomes

## Thesis Builder
- Bull case
- Bear case
- Catalysts
- Risks
- Confirmation signals
- Invalidation conditions
- Save thesis with setup/investigation

## Catalyst Radar
Track relevant events such as:
- Earnings
- Guidance
- Major company announcements
- Material news
- Analyst revisions where data is available
- Sector events

## Live News
- Load relevant current news whenever a stock is analyzed
- Load/refresh relevant news when Deep Investigation runs
- Relevance-filter results to the searched security/company
- Show source, timestamp and sentiment/context
- Manual refresh
- Graceful fallback when news provider fails
- Never fabricate headlines

## Watchlist & Journal
- Add/remove stocks
- Current price and movement
- Panic score
- Saved setups
- Investigation history
- Setup outcome tracking
- Compare expected thesis vs later outcome

## Alerts
- Price alerts
- Panic-score alerts
- Major-movement alerts
- News/catalyst alerts
- Setup-zone alerts
- Opportunity alerts

## Plans
### Standard
- Core scanner
- Basic analysis
- Interactive chart
- Basic news
- 1 saved setup
- Basic opportunity discovery

### Pro
- Everything Standard
- More saved setups
- Opportunity Scanner
- Catalyst Radar
- Thesis Builder
- Setup Journal
- Deeper investigations
- More alerts
- Advanced setup analysis

### Elite
- Everything Pro
- Unlimited setups
- Advanced Opportunity Scanner
- Scenario Simulator
- Advanced alerts
- Elite Market Reaction Map
- Multiple scenarios
- Advanced risk/reward analysis
- Full research history

The homepage should tease deeper Pro/Elite capabilities so Standard users understand there is substantially more available without making the homepage feel like an aggressive sales page.

## Professional Settings
Settings must be a real, persistent settings system, separate from Plans/Account.

Sections:
- Experience
- Charts & data
- Notifications
- Sound / volume / haptics
- Display preferences
- Default chart range
- Chart detail
- Reduce motion
- Compact mode
- Privacy/account preferences

All controls must actually persist and affect the relevant UI where applicable.

## Accounts & backend
- Real authentication state
- Persistent user preferences
- Watchlists
- Saved setups
- Investigations
- Subscription state
- Plan entitlements
- Secure API routes

## Admin/VIP
- Admin/VIP entitlement
- User access management
- Plan management
- Promo-code creation and management
- Feature access controls
- Admin dashboard

## Payments
- Real subscription state
- Real checkout integration before calling checkout functional
- Upgrade/downgrade/cancel flows
- Entitlement enforcement
- Promo-code discounts
- No fake checkout success messages

## Quality gate — mandatory
Before saying any change is complete:
1. Verify source changes in GitHub.
2. Verify the Vercel deployment completed successfully.
3. Open the actual production URL with a fresh request.
4. Verify the rendered production page, not just deployment status.
5. Test the affected buttons/flows and relevant mobile behavior.
6. Check for console/runtime/API errors where tooling permits.
7. If the production page is old, broken, or missing the change, keep fixing it.
8. Do not ask the user to verify something that has not first been verified independently.

## Known past failure to avoid
A previous implementation changed `api/ux3.js` while it still wrapped the older `ux2.js`, so GitHub and Vercel could look updated while the user still saw the old UI. Another issue was mobile navigation calling an undefined `ps2Open` function. Always verify the actual production `/` response and real interaction handlers.
