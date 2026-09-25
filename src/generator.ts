import * as cheerio from 'cheerio';

export interface GeneratorOptions {
  language: 'typescript' | 'javascript' | 'python' | 'java';
  className?: string;
  includeSampleTest?: boolean;
}

export interface GeneratedOutput {
  code: string;
  className: string;
  extractedElements: ExtractedElement[];
  warnings: string[];
}

export interface ExtractedElement {
  name: string;
  type: 'button' | 'input' | 'link' | 'text' | 'interactive' | 'form' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'image';
  locatorStrategy: 'role' | 'label' | 'placeholder' | 'text' | 'testid' | 'css';
  locator: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ElementInfo {
  element: any;
  name: string;
  type: string;
  strategy: 'role' | 'label' | 'placeholder' | 'text' | 'testid' | 'css';
  locatorCode: string;
  isDisabledOrHidden: boolean;
}

export function generatePageObject(
  htmlContent: string,
  options: GeneratorOptions = { language: 'typescript' }
): GeneratedOutput {
  try {
    if (!htmlContent || !htmlContent.trim()) {
      return {
        code: generateEmptyPageObjectClass(options.className || 'PageObject', options.language),
        className: options.className || 'PageObject',
        extractedElements: [],
        warnings: [],
      };
    }

    const $ = cheerio.load(htmlContent);

    // Derive class name if not provided
    let className = options.className;
    if (!className) {
      const title = $('title').text()?.trim();
      if (title) {
        className = toClassName(title);
      } else {
        const testId = $('[data-testid], [data-test-id], [data-qa]').first().attr('data-testid') ||
                      $('[data-testid], [data-test-id], [data-qa]').first().attr('data-test-id') ||
                      $('[data-testid], [data-test-id], [data-qa]').first().attr('data-qa');
        if (testId) {
          className = toClassName(testId);
        } else {
          const idAttr = $('[id]').first().attr('id');
          if (idAttr) {
            className = toClassName(idAttr);
          } else {
            className = 'PageObject';
          }
        }
      }
    }

    const elements: ElementInfo[] = [];
    const warnings: string[] = [];
    const elementCounts: Map<string, number> = new Map();

    // Extract buttons
    $('button').each((_index, el) => {
      const $el = $(el);
      if ($el.closest('iframe').length === 0) {
        const isDisabled = $el.attr('disabled') !== undefined;
        const elementInfo = extractElementLocator($, el, 'button', isDisabled, elementCounts);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }
    });

    // Extract text inputs
    $('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input:not([type])').each((_index, el) => {
      const $el = $(el);
      if ($el.closest('iframe').length === 0) {
        // Skip bare email inputs with no semantic identifier at all
        const inputType = $el.attr('type') || 'text';
        const hasAnyIdentifier = $el.attr('id') || $el.attr('placeholder') || $el.attr('aria-label') ||
                                $el.attr('data-testid') || $el.attr('data-test-id') || $el.attr('data-qa') ||
                                $el.closest('label').length > 0;

        // Only skip if it's an email input with truly no way to identify it
        if (inputType === 'email' && !hasAnyIdentifier) {
          return;
        }

        const isDisabled = $el.attr('disabled') !== undefined;
        const elementInfo = extractElementLocator($, el, 'input', isDisabled, elementCounts);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }
    });

    // Extract checkboxes
    $('input[type="checkbox"]').each((_index, el) => {
      const $el = $(el);
      if ($el.closest('iframe').length === 0) {
        const isDisabled = $el.attr('disabled') !== undefined;
        const elementInfo = extractElementLocator($, el, 'checkbox', isDisabled, elementCounts);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }
    });

    // Extract radio buttons
    $('input[type="radio"]').each((_index, el) => {
      const $el = $(el);
      if ($el.closest('iframe').length === 0) {
        const isDisabled = $el.attr('disabled') !== undefined;
        const elementInfo = extractElementLocator($, el, 'radio', isDisabled, elementCounts);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }
    });

    // Extract textareas
    $('textarea').each((_index, el) => {
      const $el = $(el);
      if ($el.closest('iframe').length === 0) {
        const isDisabled = $el.attr('disabled') !== undefined;
        const elementInfo = extractElementLocator($, el, 'textarea', isDisabled, elementCounts);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }
    });

    // Extract selects
    $('select').each((_index, el) => {
      const $el = $(el);
      if ($el.closest('iframe').length === 0) {
        const isDisabled = $el.attr('disabled') !== undefined;
        const elementInfo = extractElementLocator($, el, 'select', isDisabled, elementCounts);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }
    });

    // Extract links
    $('a').each((_index, el) => {
      const $el = $(el);
      if ($el.closest('iframe').length === 0 && $el.attr('href') !== undefined) {
        const elementInfo = extractElementLocator($, el, 'link', false, elementCounts);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }
    });

    // Extract ARIA interactive elements
    $('[role="button"], [role="link"], [role="tab"], [role="menuitem"]').each((_index, el) => {
      const $el = $(el);
      if ($el.closest('iframe').length === 0) {
        const role = $el.attr('role');
        const type = role === 'link' ? 'link' : 'interactive';
        const elementInfo = extractElementLocator($, el, type, false, elementCounts);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      }
    });

    // Check for iframes and warn
    const iframeCount = $('iframe').length;
    if (iframeCount > 0) {
      warnings.push(`Found ${iframeCount} iframe(s). Elements inside iframes are not extracted.`);
    }

    // Generate code
    const code = generateTypeScriptPageObject(className, elements, options.includeSampleTest || false);

    // Prepare output elements
    const extractedElements: ExtractedElement[] = elements.map(el => ({
      name: el.name,
      type: el.type as ExtractedElement['type'],
      locatorStrategy: el.strategy,
      locator: el.locatorCode,
    }));

    return {
      code,
      className,
      extractedElements,
      warnings,
    };
  } catch (error) {
    // Handle parsing errors gracefully
    const className = options.className || 'PageObject';
    return {
      code: generateEmptyPageObjectClass(className, options.language),
      className,
      extractedElements: [],
      warnings: [`Parser error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractElementLocator(
  $: cheerio.CheerioAPI,
  el: any,
  defaultType: string,
  isDisabledOrHidden: boolean,
  elementCounts: Map<string, number>
): ElementInfo | null {
  const $el = $(el);
  let name = '';
  let strategy: 'role' | 'label' | 'placeholder' | 'text' | 'testid' | 'css' = 'css';
  let locatorCode = '';
  let type = defaultType;

  // Priority 1: getByRole with accessible name
  const ariaLabel = $el.attr('aria-label');
  const ariaLabelledBy = $el.attr('aria-labelledby');
  let accessibleName = ariaLabel;

  if (ariaLabelledBy) {
    const labelText = $(`#${ariaLabelledBy}`).text();
    accessibleName = labelText || ariaLabel;
  }

  if (!accessibleName && (defaultType === 'button' || defaultType === 'link' || defaultType === 'interactive')) {
    accessibleName = $el.text()?.trim();
  }

  const roleAttr = $el.attr('role');
  const tagName = $el.prop('tagName')?.toLowerCase();

  if (accessibleName && (ariaLabel || roleAttr || tagName === 'button' || tagName === 'a')) {
    const role = roleAttr || getImplicitRole(tagName);
    if (role) {
      strategy = 'role';
      locatorCode = `getByRole('${role}', { name: '${escapeString(accessibleName)}' })`;
      name = toMethodName(accessibleName, type);
    }
  }

  // Priority 2: getByLabel for form fields
  if (!locatorCode && (defaultType === 'input' || defaultType === 'textarea' || defaultType === 'select' || defaultType === 'checkbox' || defaultType === 'radio')) {
    const id = $el.attr('id');
    let labelText = '';

    // Check for explicit label (label[for])
    if (id) {
      labelText = $(`label[for="${id}"]`).text()?.trim();
    }

    // Check for implicit label (input inside label)
    if (!labelText && (defaultType === 'checkbox' || defaultType === 'radio')) {
      const parentLabel = $el.closest('label');
      if (parentLabel && parentLabel.length > 0) {
        labelText = parentLabel.text()?.trim();
      }
    }

    if (labelText) {
      strategy = 'label';
      locatorCode = `getByLabel('${escapeString(labelText)}')`;
      name = toMethodName(labelText, type);
    }
  }

  // Priority 3: getByPlaceholder for inputs
  if (!locatorCode && defaultType === 'input') {
    const placeholder = $el.attr('placeholder');
    if (placeholder) {
      strategy = 'placeholder';
      locatorCode = `getByPlaceholder('${escapeString(placeholder)}')`;
      name = toMethodName(placeholder, type);
    }
  }

  // Priority 4: getByText for text-bearing elements
  if (!locatorCode && (defaultType === 'button' || defaultType === 'link' || defaultType === 'interactive')) {
    const text = $el.text()?.trim();
    if (text && text.length > 0 && text.length < 100) {
      strategy = 'text';
      locatorCode = `getByText('${escapeString(text)}')`;
      name = toMethodName(text, type);
    }
  }

  // Priority 5: getByTestId
  if (!locatorCode) {
    const testId = $el.attr('data-testid') || $el.attr('data-test-id') || $el.attr('data-qa');
    if (testId) {
      strategy = 'testid';
      locatorCode = `getByTestId('${escapeString(testId)}')`;
      name = toMethodName(testId, type);
    }
  }

  // Priority 6: CSS selector fallback
  if (!locatorCode) {
    const id = $el.attr('id');
    if (id) {
      locatorCode = `locator('#${escapeString(id)}')`;
      name = toMethodName(id, type);
    } else {
      const className = $el.attr('class');
      if (className) {
        locatorCode = `locator('.${escapeString(className.split(' ')[0])}')`;
        name = toMethodName(className.split(' ')[0], type);
      } else {
        // Use tag-based indexing as last resort
        const tagName = $el.prop('tagName')?.toLowerCase() || 'element';
        const key = `${tagName}_index`;
        const count = (elementCounts.get(key) || 0) + 1;
        elementCounts.set(key, count);

        locatorCode = `locator('${tagName}').nth(${count - 1})`;
        name = `${type}${count}`;
      }
    }
  }

  // Generate final name if still empty
  if (!name) {
    const key = type;
    const count = (elementCounts.get(key) || 0) + 1;
    elementCounts.set(key, count);
    name = `${type}${count}`;
  }

  // Add disabled/hidden flag to name if needed
  let locatorWithComment = locatorCode;
  if (isDisabledOrHidden) {
    locatorWithComment = `${locatorCode} // TODO: disabled/hidden element`;
  }

  return {
    element: el,
    name,
    type,
    strategy,
    locatorCode: locatorWithComment,
    isDisabledOrHidden,
  };
}

function getImplicitRole(tagName?: string): string | null {
  const roles: Record<string, string> = {
    button: 'button',
    a: 'link',
    input: 'textbox',
    textarea: 'textbox',
    select: 'combobox',
    img: 'img',
  };
  return roles[tagName || ''] || null;
}

function toClassName(name: string): string {
  // Remove non-alphanumeric chars and split on spaces/hyphens
  const normalized = name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .split(/[\s-]+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  return normalized || 'PageObject';
}

function toMethodName(name: string, type: string): string {
  const normalized = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/[\s-]+/)
    .filter(word => word.length > 0)
    .map((word, idx) => idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  if (!normalized) {
    return type.toLowerCase();
  }

  // Append type if name doesn't already contain it
  const typeStr = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  if (!normalized.toLowerCase().includes(type.toLowerCase())) {
    return normalized + typeStr;
  }

  return normalized;
}

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function generateTypeScriptPageObject(className: string, elements: ElementInfo[], includeSampleTest: boolean): string {
  if (elements.length === 0) {
    return generateEmptyPageObjectClass(className, 'typescript');
  }

  const locatorFields = elements
    .map(el => `  private readonly ${el.name} = this.page.${el.locatorCode};`)
    .join('\n');

  const methods = generateMethods(elements);

  const code = `import { Page, Locator } from '@playwright/test';

export class ${className} {
  constructor(private page: Page) {}

${locatorFields}

${methods}
}`;

  return code;
}

function generateMethods(elements: ElementInfo[]): string {
  const methods: string[] = [];

  elements.forEach(el => {
    const { name, type } = el;

    if (type === 'button' || type === 'interactive') {
      const clickMethodName = `click${name.charAt(0).toUpperCase() + name.slice(1)}`;
      methods.push(`  async ${clickMethodName}(): Promise<void> {
    await this.${name}.click();
  }`);
    }

    if (type === 'input' || type === 'textarea') {
      const fillMethodName = `fill${name.charAt(0).toUpperCase() + name.slice(1)}`;
      methods.push(`  async ${fillMethodName}(value: string): Promise<void> {
    await this.${name}.fill(value);
  }`);
    }

    if (type === 'select') {
      const selectMethodName = `select${name.charAt(0).toUpperCase() + name.slice(1)}`;
      methods.push(`  async ${selectMethodName}(value: string): Promise<void> {
    await this.${name}.selectOption(value);
  }`);
    }

    if (type === 'checkbox') {
      const checkMethodName = `check${name.charAt(0).toUpperCase() + name.slice(1)}`;
      methods.push(`  async ${checkMethodName}(): Promise<void> {
    await this.${name}.check();
  }`);

      const uncheckMethodName = `uncheck${name.charAt(0).toUpperCase() + name.slice(1)}`;
      methods.push(`  async ${uncheckMethodName}(): Promise<void> {
    await this.${name}.uncheck();
  }`);
    }

    if (type === 'radio') {
      const selectMethodName = `select${name.charAt(0).toUpperCase() + name.slice(1)}`;
      methods.push(`  async ${selectMethodName}(): Promise<void> {
    await this.${name}.check();
  }`);
    }

    if (type === 'link') {
      const clickMethodName = `click${name.charAt(0).toUpperCase() + name.slice(1)}`;
      methods.push(`  async ${clickMethodName}(): Promise<void> {
    await this.${name}.click();
  }`);
    }

    // Add visibility check for all interactive elements
    const isVisibleMethodName = `is${name.charAt(0).toUpperCase() + name.slice(1)}Visible`;
    methods.push(`  async ${isVisibleMethodName}(): Promise<boolean> {
    return await this.${name}.isVisible();
  }`);
  });

  return methods.join('\n\n');
}

function generateEmptyPageObjectClass(className: string, language: string): string {
  if (language === 'typescript') {
    return `import { Page } from '@playwright/test';

export class ${className} {
  constructor(private page: Page) {}
}`;
  }
  return '';
}
