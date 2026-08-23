# GEMINI.md — how work gets finished in this repo

Read [CLAUDE.md](CLAUDE.md), [CODING_RULES.md](CODING_RULES.md), [CHART_STANDARDS.md](CHART_STANDARDS.md) and the current part in [BUILD_PLAN.md](BUILD_PLAN.md) first. Those tell you **how to write** the code. This file tells you **how to prove it works**, and it overrides any instinct to report success early.

Every rule below exists because that exact defect shipped here and was found later. None of it is hypothetical.

---

## 0. The one rule

> **A task is not done when it compiles. It is done when you have run it and pasted the output.**

A green `tsc` proved nothing here: the backend type-checked perfectly while **login was mathematically impossible** (passwords were hashed twice) and while **the server could not boot at all** (`.env` had `JWT_SECRET`, config required `JWT_ACCESS_SECRET`).

If you did not run it, say: _"written but not executed"_. Never say "done", "working", "integrated" or "verified" for code you have not driven.

---

## 1. Before you write anything

```bash
# 1. Does the backend actually boot? If not, fix that first — nothing else is testable.
cd e-commerce-backend && npm run build && node dist/server.js      # expect: "listening on port"

# 2. Is Mongo a replica set? Transactions silently fail without it.
mongosh --quiet --eval "rs.status().ok"                           # expect: 1

# 3. Is something stale already holding the port?
#    A server started an hour ago serves OLD code and will give you FALSE results.
```

```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen |
  ForEach-Object { Get-Process -Id $_.OwningProcess | Select-Object Id,Name,StartTime }
```

I lost a full debug cycle to #3 in this repo: a server from 40 minutes earlier answered my requests and reported failures that were already fixed on disk. **Check the start time against your last edit.**

---

## 2. Never invent an endpoint

Before calling any API path, list what the server actually mounts:

```bash
cd e-commerce-backend && grep -rn "router\.\(get\|post\|patch\|delete\)" src/modules/*/
```

What shipped here instead: `/auth/signup-request`, `/auth/verify-signup`, `/auth/verify-forgot-password` — **none of which exist**. Plus `/staffs` where the backend mounts `/staff`, and four calls to `/api/v1/auth/...` where the base URL _already_ ends in `/api/v1`, producing `/api/v1/api/v1/auth/login`.

For every endpoint you touch, fill this in from **both sides** — never from memory:

| Frontend call      | Backend route       | Request fields     | Response fields      | Status   |
| ------------------ | ------------------- | ------------------ | -------------------- | -------- |
| `POST /auth/login` | `auth.routes.ts:10` | `{email,password}` | `{accessToken,user}` | tested ✓ |

If a row is not "tested", the feature is not done.

---

## 3. Test the contract, not the code

Type-checking each side separately is worthless — both sides can be internally consistent and still incompatible. These all passed `tsc` here and all were broken:

- **Three different auth headers.** Backend read `Authorization: Bearer <t>`, dashboard sent `token: <t>`, website sent `Authorization: <t>` with no `Bearer`. **No frontend could authenticate.**
- **OTP length.** UI rendered 4 boxes; backend issued 6-digit codes. Verification could never succeed.
- **Reset payload.** UI sent `{email, newPassword, otp}`; backend wanted `{resetToken, newPassword}`.
- **Wrapper shape.** `tryCatchWrapper` calls the trigger with `{body, params}`, but every generated RTK slice used `query: (data) => ({body: data})` — sending `{"body":{...}}`, so `req.body.email` was `undefined` server-side.

**Prove it with a real request.** Windows note: `curl.exe` does not strip single quotes — put the JSON in a file (`-d @body.json`) or you will chase phantom "user not found" errors.

---

## 4. Definition of done

Paste the actual terminal output for each. "I ran it and it passed" is not evidence.

```bash
# All three must be clean — the dashboard needs `tsc -b`, plain `tsc --noEmit`
# skips referenced projects and will hide real errors from you.
cd e-commerce-backend    && npm run build
cd e-commerce-dashboard  && npm run build && npm run lint
cd e-commerce-website    && npm run build && npm run lint
```

Then, for the part you built:

- [ ] Server started, `/health` answered
- [ ] Every "Done when" line in BUILD_PLAN for this part, **executed**, output pasted
- [ ] Happy path driven end to end against the real API
- [ ] One failure path driven (wrong password, missing permission, expired token)
- [ ] Every `DUMMY_*` array this part replaces is deleted
- [ ] **Both locales rendered and pasted** — a page that only works in Bengali is not done:

```bash
# Every new string must appear translated in BOTH trees, in the HTML — not swapped by JS.
curl -s localhost:3000/bn/shop | grep -o "সব পণ্য"
curl -s localhost:3000/en/shop | grep -o "All Products"
```

- [ ] No user-visible string literal left in the files you touched — every one reads from `src/i18n/dictionaries/`, and `bn.json` + `en.json` both changed
- [ ] `grep -rn "TODO\|FIXME\|console.log" src/` on files you touched — clean
- [ ] BUILD_PLAN §J tracker updated only now

Write a throwaway script for this and run it. A pass/fail list beats prose:

```
PASS  staff.view granted        -> GET /staff  200
PASS  staff.manage_roles missing-> GET /roles  403
```

---

## 5. Traps specific to this machine

- **PowerShell 5.1 writes UTF-16.** `>`, `>>` and `Out-File` default to UTF-16LE. This repo's `.gitignore` was UTF-16, so **git parsed none of it** — `.env` (JWT secrets, Gmail app password, Cloudinary keys) and `node_modules` were both unignored and one `git add .` from being committed. Always `Set-Content -Encoding ascii` for config files, and verify: `git check-ignore -v <path>`.
- **The filesystem is case-insensitive.** `Auth.type.ts` and `auth.type.ts` are the same file. A barrel export with the wrong casing works locally and breaks on Linux CI.
- **TypeScript 7 is the native port.** It exposes no JS compiler API (`ts.sys` is `undefined`), so `ts-node`/`ts-node-dev` **cannot run at all**. This repo uses `tsx`. Don't "fix" a crash by reinstalling ts-node.
- **Killing a background task may leave the child alive.** Stopping an `npx` wrapper does not always kill the node process holding the port. Verify with `Get-NetTCPConnection` before trusting your next test.

---

## 6. Landmines already known in this codebase

- **Never hash a password before `User.create()` or `user.save()`.** The `pre('save')` hook owns hashing. Hashing first stores `hash(hash(pw))` and the account can never log in. This bug shipped in four places — `verifyOtp`, `resetPassword`, `changePassword` and `createStaff`. `findByIdAndUpdate` _does_ bypass the hook, so `updateStaff` correctly hashes. Know which you are calling.
- **Nothing reads `process.env` directly.** `src/app/config/index.ts` is Zod-validated and typed. The previous work built that config and then left 20+ direct `process.env` reads with hardcoded fallbacks like `process.env.JWT_SECRET || 'ECommerce_secret'` — meaning a renamed variable would have silently signed every token with a string committed to the repo.
- **A validation file that nothing imports is not validation.** `auth.validation.ts` existed and was wired to zero of the 11 auth routes.
- **The JWT carries `{userId, role, email}` — no permissions.** Resolve them from `GET /auth/me`.
- **Two implementations of the same feature means both are wrong.** The website had a full `AuthServiceAPi.ts` that _nothing imported_, plus live `clientFetch` calls, neither working. Before writing a service, `grep` for one.

---

## 7. Anti-patterns to refuse

| Pattern                                | Why it failed here                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| "It compiles, so it works"             | Backend compiled clean and could not boot                                                                                                           |
| Security code that looks right         | OTP cap only changed the error text — a correct guess on attempt 50 still succeeded                                                                 |
| Leaving reasoning in the source        | `requirePermission` shipped with "Or maybe ALL of them? Wait, the spec says…" comments                                                              |
| Copying a template and renaming        | Left Yatos/eKayzone types, endpoints and dummy data throughout                                                                                      |
| Marking a checklist item done on write | Much of Part 0/1 was written competently, but no "Done when" list was ever executed — the server could not start, so none of them _could_ have been |
| Silently narrowing scope               | If you skip something, say exactly what and why                                                                                                     |
| Hardcoding UI text "just for now"      | Every static text is localized (CODING_RULES §2.6). A literal in JSX renders identically in `/bn` and `/en` — the bug is invisible until a user switches language |
| Checking only `/bn` and calling it done | The English tree is a separate render; `curl` both or you have verified half the feature                                                            |

---

## 8. What to report

```
DONE      <what runs, with pasted evidence>
NOT DONE  <what you skipped, and why>
UNVERIFIED <what you wrote but could not execute, and what blocks it>
BROKEN    <what you found broken but did not fix>
```

Reporting a real blocker is a good outcome. Reporting "complete" for code you never ran is the failure this document exists to prevent.

---

## 9. Image Updates

> **Do not update images implicitly.** Only update or replace images when explicitly told "update image". Otherwise, leave image files and image paths exactly as they are.
