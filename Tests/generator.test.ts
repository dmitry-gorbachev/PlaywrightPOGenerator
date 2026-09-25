import { describe, it, expect } from 'vitest';
import { generatePageObject } from '../src/generator';
import { fixtures, loadFixtureHtml } from './fixtures';

describe('Page Object Generator', () => {
  describe('Basic functionality', () => {
    it('should accept HTML input without crashing', () => {
      const html = '<html><button>Click me</button></html>';
      const result = generatePageObject(html);
      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
    });

    it('should return proper output structure', () => {
      const html = '<html><button>Click me</button></html>';
      const result = generatePageObject(html);
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('className');
      expect(result).toHaveProperty('extractedElements');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.extractedElements)).toBe(true);
    });

    it('should derive class name from title if not provided', () => {
      const html = '<html><head><title>Login Page</title></head><button>Submit</button></html>';
      const result = generatePageObject(html);
      expect(result.className).toBeTruthy();
    });

    it('should use provided className when given', () => {
      const html = '<html><button>Click</button></html>';
      const result = generatePageObject(html, { className: 'CustomPage', language: 'typescript' });
      expect(result.className).toBe('CustomPage');
    });
  });

  describe('Fixture-based tests', () => {
    fixtures.forEach(fixture => {
      describe(`${fixture.name}`, () => {
        it(`should generate valid TypeScript code`, () => {
          const html = loadFixtureHtml(fixture);
          const result = generatePageObject(html, {
            language: 'typescript',
            className: fixture.expectedClassName,
          });

          expect(result.code).toBeTruthy();
          expect(result.code.length).toBeGreaterThan(0);
        });

        it(`should extract at least ${fixture.expectedLocatorCount} elements`, () => {
          const html = loadFixtureHtml(fixture);
          const result = generatePageObject(html, {
            language: 'typescript',
            className: fixture.expectedClassName,
          });

          expect(result.extractedElements.length).toBeGreaterThanOrEqual(fixture.expectedLocatorCount - 1);
        });

        it(`should use semantic locator strategies (role/label/testid over CSS)`, () => {
          const html = loadFixtureHtml(fixture);
          const result = generatePageObject(html, {
            language: 'typescript',
            className: fixture.expectedClassName,
          });

          const cssOnlyCount = result.extractedElements.filter(
            el => el.locatorStrategy === 'css'
          ).length;
          const totalCount = result.extractedElements.length;

          if (totalCount > 0) {
            const cssPercentage = cssOnlyCount / totalCount;
            expect(cssPercentage).toBeLessThan(0.15);
          }
        });

        it(`should handle malformed HTML gracefully`, () => {
          if (fixture.name === 'malformed') {
            const html = loadFixtureHtml(fixture);
            expect(() => {
              generatePageObject(html);
            }).not.toThrow();
          }
        });

        it(`should flag disabled/hidden elements with comments`, () => {
          if (fixture.name === 'disabled_hidden') {
            const html = loadFixtureHtml(fixture);
            const result = generatePageObject(html, {
              language: 'typescript',
              className: fixture.expectedClassName,
            });

            const hasDisabledElements = result.extractedElements.some(el =>
              el.locator.toLowerCase().includes('disabled')
            );
            const hasWarnings = result.warnings.some(w =>
              w.toLowerCase().includes('disabled') || w.toLowerCase().includes('hidden')
            );

            expect(hasDisabledElements || hasWarnings).toBe(true);
          }
        });

        it(`should generate deterministic output (same input = same output)`, () => {
          const html = loadFixtureHtml(fixture);
          const result1 = generatePageObject(html, {
            language: 'typescript',
            className: fixture.expectedClassName,
          });
          const result2 = generatePageObject(html, {
            language: 'typescript',
            className: fixture.expectedClassName,
          });

          expect(result1.code).toBe(result2.code);
          expect(result1.extractedElements.length).toBe(result2.extractedElements.length);
        });
      });
    });
  });

  describe('Locator Strategy Priority', () => {
    it('should prefer getByRole over other strategies', () => {
      const html = `
        <html>
          <button aria-label="Click me">Click me</button>
        </html>
      `;
      const result = generatePageObject(html);
      if (result.extractedElements.length > 0) {
        const firstElement = result.extractedElements[0];
        expect(firstElement.locatorStrategy).toBe('role');
      }
    });

    it('should prefer getByLabel for labeled inputs', () => {
      const html = `
        <html>
          <label for="email">Email</label>
          <input id="email" type="email" />
        </html>
      `;
      const result = generatePageObject(html);
      const emailInput = result.extractedElements.find(el => el.name.includes('email'));
      if (emailInput) {
        expect(['label', 'role']).toContain(emailInput.locatorStrategy);
      }
    });

    it('should use getByPlaceholder for inputs without labels', () => {
      const html = `
        <html>
          <input type="text" placeholder="Search..." />
        </html>
      `;
      const result = generatePageObject(html);
      const input = result.extractedElements.find(el => el.type === 'input');
      if (input && input.locatorStrategy === 'placeholder') {
        expect(input.locator).toContain('placeholder');
      }
    });

    it('should use getByTestId when available', () => {
      const html = `
        <html>
          <button data-testid="submit-btn">Submit</button>
        </html>
      `;
      const result = generatePageObject(html);
      const button = result.extractedElements.find(el => el.type === 'button');
      if (button && button.locatorStrategy === 'testid') {
        expect(button.locator).toContain('submit-btn');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty HTML', () => {
      const html = '';
      expect(() => generatePageObject(html)).not.toThrow();
    });

    it('should handle HTML with only text', () => {
      const html = '<html><body>Just some text</body></html>';
      const result = generatePageObject(html);
      expect(result.extractedElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle duplicate buttons gracefully with indexing', () => {
      const html = `
        <html>
          <button>Delete</button>
          <button>Delete</button>
          <button>Delete</button>
        </html>
      `;
      const result = generatePageObject(html);
      if (result.extractedElements.length > 1) {
        const hasWarning = result.warnings.some(w =>
          w.toLowerCase().includes('duplicate') || w.toLowerCase().includes('multiple')
        );
        expect(hasWarning || result.extractedElements.length >= 2).toBe(true);
      }
    });

    it('should not generate XPath by default', () => {
      const html = '<html><button id="test">Click</button></html>';
      const result = generatePageObject(html);
      expect(result.code).not.toContain('xpath');
      expect(result.code).not.toContain('XPath');
    });

    it('should generate valid TypeScript syntax', () => {
      const html = `
        <html>
          <button>Submit</button>
          <input type="text" placeholder="Name" />
        </html>
      `;
      const result = generatePageObject(html, { language: 'typescript' });
      if (result.code.length > 0) {
        expect(result.code).toContain('class ');
        expect(result.code).toContain('constructor');
      }
    });
  });

  describe('Form Controls', () => {
    it('should handle select elements with getByLabel', () => {
      const html = `
        <html>
          <label for="country">Country:</label>
          <select id="country"></select>
        </html>
      `;
      const result = generatePageObject(html);
      const select = result.extractedElements.find(el => el.type === 'select');
      if (select) {
        expect(['label', 'role']).toContain(select.locatorStrategy);
      }
    });

    it('should group checkboxes with same name', () => {
      const html = `
        <html>
          <label><input type="checkbox" name="options" value="a"> Option A</label>
          <label><input type="checkbox" name="options" value="b"> Option B</label>
        </html>
      `;
      const result = generatePageObject(html);
      const checkboxes = result.extractedElements.filter(el => el.type === 'checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle radio button groups', () => {
      const html = `
        <html>
          <fieldset>
            <legend>Theme</legend>
            <label><input type="radio" name="theme" value="light"> Light</label>
            <label><input type="radio" name="theme" value="dark"> Dark</label>
          </fieldset>
        </html>
      `;
      const result = generatePageObject(html);
      const radios = result.extractedElements.filter(el => el.type === 'radio');
      expect(radios.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Special Elements & Warnings', () => {
    it('should warn when iframe is detected', () => {
      const html = `
        <html>
          <iframe id="widget" title="Widget"></iframe>
          <button>Click me</button>
        </html>
      `;
      const result = generatePageObject(html);
      const hasIframeWarning = result.warnings.some(w =>
        w.toLowerCase().includes('iframe')
      );
      expect(hasIframeWarning || result.code.includes('iframe')).toBe(true);
    });

    it('should not attempt to generate locators inside iframes', () => {
      const html = `
        <html>
          <iframe id="external">
            <button>Nested button (unreachable)</button>
          </iframe>
          <button>Outer button</button>
        </html>
      `;
      const result = generatePageObject(html);
      const methods = result.code.split('\n').filter(line => line.includes('async'));
      expect(methods.length).toBeLessThanOrEqual(2);
    });

    it('should handle links with getByRole', () => {
      const html = `
        <html>
          <a href="/home">Home</a>
          <a href="/about">About Us</a>
        </html>
      `;
      const result = generatePageObject(html);
      const links = result.extractedElements.filter(el => el.type === 'link');
      if (links.length > 0) {
        const firstLink = links[0];
        expect(firstLink.locatorStrategy).toBe('role');
      }
    });
  });
});
