# First prompt for Codex

You are taking over a product called `migratory-dawn`.

The product requirements, visual principles, architecture, confirmed API findings, decisions, and current progress are stored in this repository.

Before making any change, read in this order:

1. `AGENTS.md`
2. `docs/PRD.md`
3. `docs/DESIGN.md`
4. `docs/TECHNICAL.md`
5. `docs/PROGRESS.md`
6. `docs/DECISIONS.md`

Do not assume access to any previous ChatGPT conversation.

Current immediate task:

1. Diagnose the npm error `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`.
2. Inspect npm registry, proxy, https-proxy, strict-ssl, custom CA configuration, VPN/proxy effects, and Node/npm environment.
3. Prefer secure fixes.
4. Do not permanently disable SSL verification.
5. Verify recovery with `npm ping`.
6. Create the `migratory-dawn` Next.js project using App Router, TypeScript, Tailwind CSS, ESLint, and npm.
7. Run the local development server.
8. Report:
   - commands executed;
   - configuration changed;
   - project path;
   - local URL;
   - verification result.
9. Do not begin Windy, Mapbox, or Supabase feature implementation until the environment and empty app are confirmed.
10. Update `docs/PROGRESS.md` after completion.
