# Brand Consistency Gate

The verification pass for audience-facing work. Read on a `verify` route in the marketing, brand, or content domains. Cannot be disabled on that route.

Verification means producing evidence, not asserting quality. Every line below is a check with an observable answer.

## Against the brand bible

- Colours are bound to token roles, not to raw values copied from somewhere else.
- Type scale and spacing come from the token scale. Off-scale values are either a deliberate, recorded exception or a defect.
- Voice matches the recorded attributes; nothing on the banned-phrase list survived.
- Logo usage respects clear-space and misuse rules.

If no brand bible exists, say so explicitly in the report rather than inventing a standard. An approved client design document outranks any general filter.

## Across languages

- Every slot is filled in every declared locale — no fallback text shipped as final.
- Numbers, dates, and currency are formatted per locale, not copied from the source language.
- Nothing overflows or breaks mid-phrase at the declared breakpoints in any locale.
- The call to action is a real call to action in each language, not a literal translation of one.

## Factual integrity

- Every claim, statistic, price, and date traces to a source with a date.
- Prices, availability, and offer terms match the live system of record, not an earlier draft.
- Names, titles, and organizations are spelled as the holder spells them.
- Links resolve, go where the copy says, and carry the intended tracking parameters — no more.

## Surface checks

- The deliverable renders correctly at the smallest declared viewport, not only the design width.
- Contrast meets the accessibility standard the project declared.
- Images carry meaningful alternative text; decorative images are marked decorative.
- Tracking fires once per event, and non-essential tracking respects consent state.

## Reporting

Report what you actually checked, on what, and how:

- Named surfaces and locales verified.
- Checks that passed, with the method.
- Checks that failed, with the specific instance.
- **Checks not performed, and why.**

Never report a check you did not run. An honest "not verified" is usable information; a claimed pass that was not tested destroys the value of every other line in the report.
