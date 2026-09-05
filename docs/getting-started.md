# Getting started

Start with an explicit route. Choose the product surface and framework, then name the current task rather than the entire project roadmap.

```bash
node scripts/cli.mjs route --platform website --framework next --task design
node scripts/cli.mjs route --platform desktop --framework winui --task bug --target windows
node scripts/cli.mjs route --platform mobile --framework expo --task release --target android --risks auth,payment
```

Read the returned platform reference and activate the returned capabilities in order. If an upstream skill is not installed in your agent, follow its pinned source link in `registry/skills.json` and use the installation mechanism supported by that agent. Do not copy every referenced skill into the prompt.

Project detection accepts a JSON map of relative file names to contents. It only suggests a route and deliberately asks for input when a repository contains multiple targets.
