---
intent: "Open the-internet.herokuapp.com and attempt to click a button that does not exist, capturing live browser state in the postmortem"
---

# Browser Failure Example

Opens a real browser on a public automation practice site, then intentionally
fails trying to click a non-existent element. Verify that the postmortem
folder contains ally-tree.json and clickables.json with the live page state.

## Variables

- url=https://the-internet.herokuapp.com

## Steps

- Open Page
- Click Non Existent Button
