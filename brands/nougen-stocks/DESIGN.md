# NouGenStocks design system

## 1. Purpose

NouGenStocks helps a user inspect a watchlist, understand a trade's planned risk, and keep a paper journal. The interface should make the origin and freshness of financial data clear before a user acts on it.

## 2. Brand character

Observed: the product uses the NouGenStocks name, a dark market dashboard, compact instrument cards, and a lime accent. Inferred: a restrained interface supports frequent scanning and makes numerical changes easier to compare. Invented: token roles and usage rules below.

## 3. Color system

Use semantic custom properties from `tokens.css`. Dark is the default theme. Light mode uses `data-theme="light"`; the system light preference is also supported until a theme is explicitly selected. Positive and negative colors identify direction, and must not communicate a recommendation by themselves.

## 4. Typography

DM Sans is the body face, Manrope is reserved for prominent headings, and DM Mono is used for prices, percentages, and compact numeric readouts. Keep numeric values aligned and label their units.

## 5. Layout and spacing

Use the supplied 4px spacing steps as the basis for padding and gaps. Market tables may be dense, but sections retain clear headings and data provenance notes. Avoid adding animation to price or risk values.

## 6. Components

Cards group one instrument or one risk concept. Tables align comparable values by column. Badges state status or provenance in text as well as color. The position planner separates inputs, calculated outputs, and explanatory assumptions.

## 7. Data provenance

Sample fixtures must be labeled as sample wherever their numbers or derived scores are displayed. Source commentary must identify the speaker and must not read as a current quote or verified market fact. Upstream Unk risk settings are distinct from NouGenStocks demo scoring, grades, and journal guardrails.

## 8. Accessibility

All interactive elements have a visible `:focus-visible` treatment. Maintain keyboard access and accessible names. Status cannot rely on color alone. Honor `prefers-reduced-motion`. Check foreground and background pairs against WCAG AA for ordinary text when changing token values.

## 9. Theme and responsive behavior

Dark and light themes use the same semantic roles. Preserve readable contrast at narrow widths; horizontally scroll wide market tables instead of shrinking numeric values until they become ambiguous.

## 10. Provenance

Observed details describe the current product. Inferences describe design intent. Invented details are proposed conventions, not claims of an existing brand standard.
