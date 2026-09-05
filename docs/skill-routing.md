# Skill routing

The default output aims for two to five active capabilities. More than five produces a warning and more than seven requires a written justification. Review capabilities should run in bounded passes after implementation.

Every report starts with `Skill bundle: development-skill-router -> ...`. The names after the arrow are invocation names, which can differ from the stable registry IDs. Agents must report only capabilities whose instructions they actually read and follow. Code and configuration work re-routes through `verify` before completion.

Examples of deliberate separation:

- A database bug selects systematic debugging and the configured data specialist, without loading UI design guidance.
- A mobile design pass selects product design and the chosen target's UX reviewer, without changing framework implementation authority.
- A Tauri React app keeps Tauri as the desktop authority and scopes React guidance to the renderer.
- Sensitive behavior adds the security gate even in minimal mode.
