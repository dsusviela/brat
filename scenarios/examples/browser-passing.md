---
intent: "Open the-internet.herokuapp.com, navigate to the Checkboxes page via link, and confirm the page heading is visible"
---

# Browser Passing Example

Demonstrates composing generic blocks into a passing browser scenario.
Each block reads its inputs from scenario variables, so the same blocks
can be reused in other scenarios with different values.

## Variables

- url=https://the-internet.herokuapp.com
- link-text=Checkboxes
- heading-text=Checkboxes

## Steps

- Open Page
- Click Link
- Assert Heading Visible
