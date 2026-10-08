# Questions after stop 2

After stop 2 the company works unattended — the user may be asleep. A question that comes up is never a reason to stop everything, and never a reason to guess what only the user can decide.

## Route every question

Classify it with [`decision-classify`](../../decision-classify/SKILL.md):

| Class | Examples | What happens |
|---|---|---|
| **User** — or anything about scope, budget, data, security, deploy, deletion, an outward action | "Store cards in Stripe or not?", "Drop the legacy table?" | `mcp__company-hq__ask_user({text, part, options})` → `PushNotification` → keep working on the parts that do not depend on it. The blocked part reports `BLOCKED` with the question id. Never guess. |
| **Mechanical / Taste** | naming, file layout, which of two equivalent libraries, button placement | decided without the user (below) and logged with `record_decision` |

When unsure between User and Taste, it is User.

## Deciding without the user

1. Write 2–4 options and your recommendation, with one line of reason each.
2. Choose your recommendation. If you have an external scorer you trust, it may add scores to the log, but it never decides a User-class question.
3. Log it: `mcp__company-hq__record_decision({text, options, chosen, by: "agent", part, class})`.

## When the user answers

Record it with `mcp__company-hq__answer_question({id, answer})`, then re-run the blocked part (one more wave of one, as for a FAIL). A part blocked on a question does not count as a failed round.

## In a part agent's brief

Part agents cannot talk to the user. Their brief carries this rule (see [workflows.md](workflows.md#parts-code)):

> If a question comes up: classify it. User-class → call `mcp__company-hq__ask_user` (load it with ToolSearch), stop the tasks that depend on it, finish what does not, and return status BLOCKED with the question id. Mechanical/Taste → decide by your recommendation (the company skill's `references/questions.md`) and call `mcp__company-hq__record_decision`.

The coordinator sends the `PushNotification` for every new question id it sees in a part report (one notification per question).

## On the dashboard

Open questions show first (red) under "Questions", with the decisions log below. Answers are given in the terminal.
