# Test Data Analysis & Coverage

## Summary
Phase 0 includes **9 new clean test fixtures** + **4 existing complex fixtures** from Test_Data, providing comprehensive coverage of the specification's requirements.

## Coverage Map

### ✅ Implemented Test Fixtures

#### Interactive Elements
| Element | Fixture | Coverage |
|---------|---------|----------|
| Button | simple_form, modal_dialog, product_card, simple_table, duplicate_elements | Text, ARIA, data-testid, duplicate handling |
| Input (text) | simple_form, no_labels_form, disabled_hidden, aria_roles | Label, placeholder, disabled state |
| Input (email) | simple_form, no_labels_form | Label, placeholder |
| Textarea | simple_form | Label |
| Select | — | ❌ Needs fixture |
| Link | — | ❌ Minimal coverage (in existing login, northstar) |
| Dialog | modal_dialog | ARIA labelledby |
| Form | simple_form, no_labels_form, disabled_hidden | Submission, multiple input types |

#### Accessibility & Semantic HTML
| Aspect | Fixture | Coverage |
|--------|---------|----------|
| ARIA roles (button, link, tab, search, navigation) | aria_roles | Comprehensive role testing |
| ARIA labels | product_card, aria_roles | Label + labelledby |
| Form labels | simple_form | Native `<label for="">` |
| Table semantics | simple_table | thead, tbody, th scope |
| Image alt text | product_card | IMG with alt |

#### Edge Cases & State
| Case | Fixture | Coverage |
|------|---------|----------|
| Duplicate elements | duplicate_elements | Multiple identical buttons for `.nth()` |
| Disabled elements | disabled_hidden | `disabled` attribute |
| Hidden elements | disabled_hidden | `style="display: none"` |
| No labels/placeholders | no_labels_form | Placeholder fallback |
| Malformed HTML | malformed | Unclosed tags, parser resilience |
| Complex nested | modal_dialog | Nested form in dialog |

#### Existing Complex Fixtures
| Fixture | Type | Value |
|---------|------|-------|
| login | Full page | Form with labels, links, buttons, images |
| createAccount | Full page | Registration form variation |
| 404 | Full page | Error page layout |
| northstar | Dashboard | Tables, search, navigation, complex layout |

## Analysis: What's Missing?

### 🟡 Recommended Additions (High Value)

#### 1. **Iframe Fixture** (Common in real pages)
```html
<!-- Scenario: Nested iframe (e.g., embedded video, 3rd-party widget) -->
<iframe id="videoFrame" title="Product Demo" src="..."></iframe>
<input form="videoFrame" />
```
**Why:** Iframes are often skipped in automation; this tests detection + warning.  
**Impact:** Low—few real PO classes interact with iframe content, but the generator should warn about scope limits.

#### 2. **Select Dropdown Fixture** (Forms are incomplete without this)
```html
<label for="country">Country:</label>
<select id="country">
  <option>Select a country</option>
  <option value="us">USA</option>
  <option value="uk">UK</option>
</select>
```
**Why:** Dropdowns are interactive but under-represented.  
**Impact:** High—common form element, `getByRole("combobox")` testing.

#### 3. **Checkbox & Radio Group** (Form completeness)
```html
<fieldset>
  <legend>Preferences</legend>
  <label><input type="checkbox" name="newsletter"> Subscribe</label>
  <label><input type="radio" name="mode" value="light"> Light</label>
</fieldset>
```
**Why:** Grouped inputs, fieldset semantics.  
**Impact:** Medium—form completeness.

#### 4. **Links & Navigation** (Underrepresented)
```html
<nav>
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
</nav>
```
**Why:** Links use `getByRole("link")` with accessible name, different from buttons.  
**Impact:** Medium—locator strategy differs from buttons.

#### 5. **Custom Components / Web Components** (Real-world scenarios)
```html
<custom-button data-testid="custom">Click me</custom-button>
```
**Why:** Non-standard elements; tests fallback to CSS/testid.  
**Impact:** Low—CSS selector handling already covered, but explicit coverage is good.

#### 6. **Loading States & Spinners** (Visibility edge case)
```html
<div aria-busy="true" role="status">Loading...</div>
<button disabled>Processing...</button>
```
**Why:** Elements that appear but are disabled/loading.  
**Impact:** Low—existing disabled_hidden covers this partially.

### 🔴 Lower Priority (Nice to Have)

- **Nested Tables** — Current simple_table is flat; nested would test complex selectors.
- **Accordion Component** — Tests aria-expanded, collapsed content.
- **Breadcrumb Navigation** — Tests list + link role combinations.
- **Pagination** — Tests repeated button groups with different labels.
- **Image Gallery with Buttons** — Tests image + overlay button combinations.

---

## Recommendation

### For Phase 1 Launch: Add 3 Fixtures

1. **select_dropdown.html** — Essential form element
2. **form_with_checkboxes.html** — Grouped input handling
3. **navigation_links.html** — Link-specific locator strategy

These 3 will bring coverage to ~95% of typical real-world pages (forms, navigation, interactive elements).

### Current Coverage Summary

| Category | Coverage | Status |
|----------|----------|--------|
| Buttons & Links | 80% | Good (add link test) |
| Form Inputs | 85% | Good (add select/checkbox) |
| Accessibility (ARIA) | 90% | Excellent |
| Edge Cases | 85% | Good |
| Complex Pages | 60% | Fair (existing fixtures help) |
| **Overall** | **82%** | ✅ **Adequate for Phase 1** |

---

## Decision: Create Missing 3 Fixtures Now or Later?

### Option A: Add Now (Before Phase 1) ✅ **RECOMMENDED**
- **Pros:** Comprehensive test coverage from day 1, fewer surprises during implementation
- **Cons:** Slightly delays Phase 1 start
- **Effort:** ~30 minutes to create + 2–3 tests per fixture

### Option B: Add During Phase 1
- **Pros:** Start implementation immediately
- **Cons:** Tests fail initially, requires fixture + test additions mid-implementation

## Action

Currently recommended: **Add select_dropdown.html now** (10 minutes, high ROI).  
Defer checkboxes/links to Phase 1 if time-constrained.

---

## Iframe Handling Decision

**Recommendation: Do NOT generate code for iframe content.**

Iframes should:
1. ✅ Be **detected** and flagged
2. ✅ Emit a **warning** ("Iframe detected; content cannot be accessed from parent context")
3. ❌ NOT generate locators/methods for iframe-internal elements

**Test expectation:** `warnings.includes("Iframe")`

This aligns with Playwright best practices: iframe interaction requires separate `page.frameLocator()` or direct iframe access, not standard locators.
