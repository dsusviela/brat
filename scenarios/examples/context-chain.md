---
intent: "Show how blocks pass data through context: Open Page sets browser+page, Click Link navigates, Read Page Title writes pageTitle, Assert Context Value reads it back"
---

# Context Chain Example

Demonstrates the context pipeline explicitly:
each block documents what it reads and what it writes,
and the next block depends on what the previous one produced.

    Open Page
      writes → context.browser, context.page

    Click Link
      reads  ← context.page
      reads  ← context.GLOBAL_LINK_TEXT ("Checkboxes")

    Read Page Title
      reads  ← context.page
      writes → context.pageTitle  (e.g. "The Internet")
      writes → context.pageUrl    (e.g. "https://the-internet.herokuapp.com/checkboxes")

    Assert Context Value
      reads  ← context.GLOBAL_CONTEXT_KEY     ("pageUrl")
      reads  ← context.GLOBAL_EXPECTED_VALUE  ("checkboxes")
      reads  ← context.pageUrl                (set by the previous block)

## Variables

- url=https://the-internet.herokuapp.com
- link-text=Checkboxes
- context-key=pageUrl
- expected-value=checkboxes

## Steps

- Open Page
- Click Link
- Read Page Title
- Assert Context Value
