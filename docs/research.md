# Research basis

Reviewed on September 5, 2026 for developers and maintainers choosing a cross-platform Agent Skills workflow.

The decisive finding is that a small router is safer and more efficient than a merged bundle. The [Agent Skills specification](https://agentskills.io/specification) defines progressive disclosure through metadata, the active `SKILL.md`, and on-demand resources; it recommends keeping the entrypoint under 500 lines. Framework scope must also remain explicit: [Tauri documentation](https://v2.tauri.app/start/) separates its native core from a web frontend, and [Electron security guidance](https://www.electronjs.org/docs/latest/tutorial/security) explains that Electron code has capabilities beyond an ordinary browser.

The registry was checked against canonical GitHub repository trees and license evidence at the commits recorded in each entry. This corrected stale recommendations: Flutter has distinct mobile and desktop targets; current Expo skill paths live under its plugin directory; Microsoft WinUI guidance is Windows desktop and preview; Taste Frontend explicitly scopes itself to landing pages, portfolios, and redesigns rather than multi-step product UI; Taste's mobile image generator creates references and does not implement code; and Vercel's repository declares MIT in its README but has no standalone root license file at the reviewed commit.

Apple and Android platform design references remain UX inputs rather than implementation authorities for cross-platform frameworks. Official current framework documentation outranks a pinned community snapshot when APIs change.

The research stopped after canonical identity, exact paths, scope, commits, licenses/notices, and the consequential conflict rules were verified. It did not execute every third-party skill or measure popularity claims, so the registry deliberately avoids install-count rankings and does not claim technical certification of upstream behavior.
