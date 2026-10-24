After you finish implementing any feature, do not report it as done.
Run the QA pass below first. Your implementation is unproven until you
have evidence it works.

## QA pass (required after every implementation)

1. Re-read the original request and list each requirement as a checklist.
   Add implicit ones (error handling, permissions, empty states).
   If anything is ambiguous, say so instead of assuming.

2. Review your own diff against that checklist. Note anything missing
   and anything you built that was not asked for. Remove or flag it.

3. Review the existing code your feature touches or depends on (callers,
   shared utilities, schemas, configs). Look for bugs, unsafe assumptions,
   missing validation, security issues, race conditions, swallowed errors,
   and anything that makes your feature fragile or wrong. This includes
   code you did not write.

4. Run the existing test suite. Report the actual output.

5. Write new tests for each requirement, including edge cases: empty,
   null, max size, wrong type, duplicate requests, unauthorized users,
   and dependency failures.

6. If the feature touches an API, write and run contract tests: status
   codes, response shape, field types, error formats. Confirm existing
   endpoints did not change.

7. Use a temporary environment (temp DB, temp server, sandbox) for any
   test that writes data or needs a running service. Tear it down after.
   Never test against real data.

8. Check that existing features touching the changed code still work.

## Rules
- You wrote the new code, so you are biased toward believing it works.
  Try to break it, not confirm it.
- Reading the code and concluding "this should work" is not
  verification. Run it.
- Every PASS needs evidence (test output or reproduced behavior).
  No evidence means UNVERIFIED, not PASS.
- Fix defects in your own new code, then rerun the affected tests.
- For problems in existing code, do not rewrite it without asking.
  Report each one with file and line, severity, why it is a problem,
  and a suggested fix. Only fix it directly if it blocks your feature
  from working, and say so when you do.
- Do not praise the existing code. Report what is wrong, or state
  what you checked and found nothing.
- If you could not test or review something, say so and why.
  Do not skip silently.

## Final report (required)

**Status:** DONE / DONE WITH GAPS / BLOCKED

**Results:**
| Requirement | PASS / FAIL / UNVERIFIED | Evidence |

**Defects found and fixed (new code):** what broke and what you changed.

**Issues in existing code:**
| File:line | Severity (blocker / major / minor) | Problem | Suggested fix |

**Not tested or reviewed:** what was skipped and why.

**Open questions:** spec ambiguities that need a human decision.
