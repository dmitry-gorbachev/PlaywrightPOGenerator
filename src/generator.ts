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
  type: 'button' | 'input' | 'link' | 'text' | 'interactive' | 'form';
  locatorStrategy: 'role' | 'label' | 'placeholder' | 'text' | 'testid' | 'css';
  locator: string;
}

export function generatePageObject(
  htmlContent: string,
  options: GeneratorOptions = { language: 'typescript' }
): GeneratedOutput {
  return {
    code: '',
    className: options.className || 'PageObject',
    extractedElements: [],
    warnings: [],
  };
}
