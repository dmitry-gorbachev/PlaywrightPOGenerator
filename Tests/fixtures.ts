import { readFileSync } from 'fs';
import { join } from 'path';

export interface FixtureSpec {
  name: string;
  htmlFile: string;
  expectedElements: {
    name: string;
    type: string;
    locatorStrategy: string;
  }[];
  expectedClassName: string;
  expectedLocatorCount: number;
  shouldInclude?: string[];
  shouldNotInclude?: string[];
}

const fixturesPath = join(__dirname, '..', 'Test_Data');

export const fixtures: FixtureSpec[] = [
  {
    name: 'simple_form',
    htmlFile: join(fixturesPath, 'simple_form.html'),
    expectedClassName: 'SimpleForm',
    expectedElements: [
      { name: 'nameInput', type: 'input', locatorStrategy: 'label' },
      { name: 'emailInput', type: 'input', locatorStrategy: 'label' },
      { name: 'messageTextarea', type: 'textarea', locatorStrategy: 'label' },
      { name: 'submitButton', type: 'button', locatorStrategy: 'text' },
      { name: 'clearButton', type: 'button', locatorStrategy: 'text' },
    ],
    expectedLocatorCount: 5,
    shouldInclude: ['fillNameInput', 'fillEmailInput', 'submitForm', 'clickSubmitButton'],
  },
  {
    name: 'modal_dialog',
    htmlFile: join(fixturesPath, 'modal_dialog.html'),
    expectedClassName: 'ModalDialog',
    expectedElements: [
      { name: 'openModalButton', type: 'button', locatorStrategy: 'text' },
      { name: 'confirmButton', type: 'button', locatorStrategy: 'text' },
      { name: 'cancelButton', type: 'button', locatorStrategy: 'text' },
    ],
    expectedLocatorCount: 3,
    shouldInclude: ['clickOpenModal', 'clickConfirm', 'clickCancel'],
  },
  {
    name: 'product_card',
    htmlFile: join(fixturesPath, 'product_card.html'),
    expectedClassName: 'ProductCard',
    expectedElements: [
      { name: 'addToCartButton', type: 'button', locatorStrategy: 'role' },
      { name: 'favoriteButton', type: 'button', locatorStrategy: 'role' },
      { name: 'productImage', type: 'image', locatorStrategy: 'css' },
    ],
    expectedLocatorCount: 3,
    shouldInclude: ['clickAddToCart', 'clickFavorite', 'getProductPrice'],
  },
  {
    name: 'simple_table',
    htmlFile: join(fixturesPath, 'simple_table.html'),
    expectedClassName: 'SimpleTable',
    expectedElements: [
      { name: 'editButtonFirstRow', type: 'button', locatorStrategy: 'css' },
      { name: 'editButtonSecondRow', type: 'button', locatorStrategy: 'css' },
    ],
    expectedLocatorCount: 2,
    shouldInclude: ['getTableRows', 'clickEditButton', 'getTableHeaders'],
  },
  {
    name: 'duplicate_elements',
    htmlFile: join(fixturesPath, 'duplicate_elements.html'),
    expectedClassName: 'DuplicateElements',
    expectedElements: [
      { name: 'deleteButton', type: 'button', locatorStrategy: 'text' },
    ],
    expectedLocatorCount: 1,
    shouldInclude: ['nth', 'deleteButton'],
  },
  {
    name: 'no_labels_form',
    htmlFile: join(fixturesPath, 'no_labels_form.html'),
    expectedClassName: 'NoLabelsForm',
    expectedElements: [
      { name: 'idSearchInput', type: 'input', locatorStrategy: 'placeholder' },
      { name: 'nameSearchInput', type: 'input', locatorStrategy: 'placeholder' },
    ],
    expectedLocatorCount: 2,
    shouldInclude: ['placeholder'],
  },
  {
    name: 'disabled_hidden',
    htmlFile: join(fixturesPath, 'disabled_hidden.html'),
    expectedClassName: 'DisabledHidden',
    expectedElements: [
      { name: 'enabledField', type: 'input', locatorStrategy: 'label' },
      { name: 'disabledField', type: 'input', locatorStrategy: 'label' },
    ],
    expectedLocatorCount: 2,
    shouldInclude: ['disabled', 'TODO'],
  },
  {
    name: 'aria_roles',
    htmlFile: join(fixturesPath, 'aria_roles.html'),
    expectedClassName: 'AriaRoles',
    expectedElements: [
      { name: 'searchInput', type: 'input', locatorStrategy: 'role' },
      { name: 'closeMenuButton', type: 'button', locatorStrategy: 'role' },
    ],
    expectedLocatorCount: 2,
    shouldInclude: ['getByRole'],
  },
  {
    name: 'malformed',
    htmlFile: join(fixturesPath, 'malformed.html'),
    expectedClassName: 'Malformed',
    expectedElements: [
      { name: 'saveButton', type: 'button', locatorStrategy: 'text' },
    ],
    expectedLocatorCount: 1,
    shouldInclude: ['should handle malformed HTML gracefully'],
  },
  {
    name: 'select_dropdown',
    htmlFile: join(fixturesPath, 'select_dropdown.html'),
    expectedClassName: 'SelectDropdown',
    expectedElements: [
      { name: 'countrySelect', type: 'select', locatorStrategy: 'label' },
      { name: 'timezoneSelect', type: 'select', locatorStrategy: 'label' },
      { name: 'saveButton', type: 'button', locatorStrategy: 'text' },
    ],
    expectedLocatorCount: 3,
    shouldInclude: ['selectOption', 'countrySelect', 'timezoneSelect'],
  },
  {
    name: 'form_with_checkboxes',
    htmlFile: join(fixturesPath, 'form_with_checkboxes.html'),
    expectedClassName: 'FormWithCheckboxes',
    expectedElements: [
      { name: 'emailNotifications', type: 'checkbox', locatorStrategy: 'label' },
      { name: 'smsNotifications', type: 'checkbox', locatorStrategy: 'label' },
      { name: 'pushNotifications', type: 'checkbox', locatorStrategy: 'label' },
      { name: 'lightModeRadio', type: 'radio', locatorStrategy: 'label' },
      { name: 'darkModeRadio', type: 'radio', locatorStrategy: 'label' },
      { name: 'autoRadio', type: 'radio', locatorStrategy: 'label' },
    ],
    expectedLocatorCount: 6,
    shouldInclude: ['checkEmailNotifications', 'selectLightMode', 'fieldset'],
  },
  {
    name: 'navigation_links',
    htmlFile: join(fixturesPath, 'navigation_links.html'),
    expectedClassName: 'NavigationLinks',
    expectedElements: [
      { name: 'homeLink', type: 'link', locatorStrategy: 'role' },
      { name: 'docsLink', type: 'link', locatorStrategy: 'role' },
      { name: 'contactLink', type: 'link', locatorStrategy: 'role' },
    ],
    expectedLocatorCount: 3,
    shouldInclude: ['clickHomeLink', 'getByRole', 'link'],
  },
  {
    name: 'page_with_iframe',
    htmlFile: join(fixturesPath, 'page_with_iframe.html'),
    expectedClassName: 'PageWithIframe',
    expectedElements: [
      { name: 'watchDemoButton', type: 'button', locatorStrategy: 'text' },
      { name: 'reviewsLink', type: 'link', locatorStrategy: 'text' },
    ],
    expectedLocatorCount: 2,
    shouldInclude: ['iframe', 'warning'],
  },
];

export function loadFixtureHtml(fixture: FixtureSpec): string {
  return readFileSync(fixture.htmlFile, 'utf-8');
}

export function getFixtureByName(name: string): FixtureSpec | undefined {
  return fixtures.find(f => f.name === name);
}
