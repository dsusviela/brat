---
intent: "Demonstrate postmortem generation by running a block that always fails"
---

# Failing Example

Runs a successful block first, then a block that always throws, to show
that completed steps and the failure are both captured in the postmortem.

## Variables

- name=Postmortem Demo

## Steps

- Log Hello
- Always Fails
