# Phase 0: Test-Driven Development Setup

## Overview
Phase 0 establishes the test harness and fixture suite before implementation. This follows strict TDD methodology: tests drive implementation, not the other way around.

## Current Status
✅ **Complete** — Test suite is fully functional and provides clear red/green feedback loop.

### Test Results
```
Test Files  1 failed (1)
Tests       28 failed | 69 passed (97)
```

**Passing (69):** Basic structure, edge cases, determinism, no XPath generation, form controls  
**Failing (28):** Code generation and element extraction (expected—implementation pending)

## Project Structure

```
src/
  └── generator.ts          # Empty stub implementing GeneratedOutput interface

Tests/
  ├── fixtures.ts           # 9 test fixtures with expected outputs
  ├── generator.test.ts     # 67 comprehensive tests (3 test suites)
  └── (test data in Test_Data/)

Test_Data/
  ├── simple_form.html              # Form with labels
  ├── modal_dialog.html             # Dialog with ARIA
  ├── product_card.html             # Card with ARIA + testid
  ├── simple_table.html             # Table structure
  ├── duplicate_elements.html       # Multiple identical buttons
  ├── no_labels_form.html           # Inputs with only placeholders
  ├── disabled_hidden.html          # Disabled and hidden elements
  ├── aria_roles.html               # Complex ARIA roles
  ├── malformed.html                # Unclosed tags
  └── [existing] login/, createAccount/, 404/, northstar/
```

## Test Suite Breakdown

### 1. Basic Functionality (4 tests)
- HTML input acceptance without crashes
- Output structure validation
- Class name derivation from `<title>`
- Custom className support

### 2. Fixture-Based Tests (54 tests)
Per fixture, validates:
- Valid TypeScript code generation
- Element extraction (≥ expected count)
- Locator strategy preference (semantic > CSS)
- Malformed HTML resilience
- Disabled/hidden element flagging
- Deterministic output (idempotence)

### 3. Locator Strategy Priority (4 tests)
- `getByRole()` over other strategies ✓
- `getByLabel()` for labeled inputs
- `getByPlaceholder()` for unlabeled inputs
- `getByTestId()` when available

### 4. Edge Cases (5 tests)
- Empty HTML handling
- Text-only HTML
- Duplicate elements with indexing
- No XPath generation
- Valid TypeScript syntax

### 5. Form Controls (3 tests)
- Select dropdowns with labels
- Checkbox grouping by name
- Radio button group handling

### 6. Special Elements & Warnings (5 tests)
- Iframe detection and warnings
- No locator generation inside iframes
- Link element handling with getByRole
- Video/widget embedding scenarios

## Test Fixtures & Expected Outputs

| Fixture | Elements | Focus | Status |
|---------|----------|-------|--------|
| **simple_form** | 5 | Labels, textarea, form submission | ✅ |
| **modal_dialog** | 3 | Dialog element, ARIA labelledby | ✅ |
| **product_card** | 3 | ARIA roles (button), data-testid | ✅ |
| **simple_table** | 2 | Table structure, row indexing | ✅ |
| **duplicate_elements** | 1 (3×) | Duplicate handling with `.nth()` | ✅ |
| **no_labels_form** | 2 | Placeholder fallback | ✅ |
| **disabled_hidden** | 2 | Disabled/hidden element flagging | ✅ |
| **aria_roles** | 2 | Complex role/tabpanel patterns | ✅ |
| **malformed** | 1 | Parser resilience | ✅ |
| **select_dropdown** | 3 | Select elements, option handling | ✨ NEW |
| **form_with_checkboxes** | 6 | Checkbox/radio groups, fieldset | ✨ NEW |
| **navigation_links** | 3 | Link role priority, nav semantics | ✨ NEW |
| **page_with_iframe** | 2 | Iframe detection & warnings | ✨ NEW |

## Running Tests

```bash
# Run once
npm test

# Watch mode
npm test:watch

# Type check
npm run typecheck

# Lint
npm run lint
```

**All tests must pass before proceeding to Phase 1 implementation.**

## Next Steps (Phase 1)

1. **HTML Parser Module** — Extract elements from HTML respecting selector priority
2. **Locator Strategy Selector** — Priority-based locator selection (role → label → placeholder → text → testid → css)
3. **TypeScript Code Generator** — Generate class with methods and private locators
4. **Class Naming** — Derive from title, testid, id, or type-based index
5. **Method Generation** — Action (`click*()`, `fill*()`) and state (`is*Visible()`, `get*Text()`) methods
6. **Element Grouping** — Forms, tables, nested components as sub-classes

## Key Constraints

- ✅ Generate `Locator` only, no `ElementHandle`
- ✅ No XPath by default
- ✅ Locator strategy priority strictly enforced
- ✅ Deterministic naming (identical input = identical output)
- ✅ Graceful malformed HTML handling
- ✅ Disabled/hidden elements flagged with comments
- ✅ Duplicate elements handled via `.nth()`

## Architecture Notes

- **Generator** is a pure function: `(htmlContent, options) → GeneratedOutput`
- **No external state** — tests can run in parallel
- **Cheerio** for HTML parsing (CSS selector + DOM traversal)
- **TypeScript** output validated against `TS` syntax rules
- **Vitest** for fast test execution and determinism checking

---

**Phase 0 Complete** — Ready for Phase 1 implementation.
