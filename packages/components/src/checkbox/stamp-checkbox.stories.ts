import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { StampCheckbox } from './stamp-checkbox.js';
import './stamp-checkbox.js';

const meta: Meta<StampCheckbox> = {
  title: 'Components/Checkbox',
  component: 'stamp-checkbox' as unknown as typeof StampCheckbox,
  tags: ['autodocs'],

  argTypes: {
    label: {
      description: 'Visible label text next to the checkbox.',
      control: 'text',
      table: { category: 'Content' },
    },
    checked: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'State' },
    },
    indeterminate: {
      description: 'Partially-selected state. Used in "select all" patterns where some (not all) children are selected.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'State' },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'State' },
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' }, category: 'Appearance' },
    },
  },

  args: {
    label: 'Accept terms and conditions',
    checked: false,
    indeterminate: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<StampCheckbox>;

export const Playground: Story = {
  name: 'Playground',
  render: (args) => html`
    <stamp-checkbox
      label=${args.label ?? ''}
      ?checked=${args.checked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
    ></stamp-checkbox>
  `,
};

export const AllStates: Story = {
  name: 'All States',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <stamp-checkbox label="Unchecked"></stamp-checkbox>
      <stamp-checkbox label="Checked" checked></stamp-checkbox>
      <stamp-checkbox label="Indeterminate" indeterminate></stamp-checkbox>
      <stamp-checkbox label="Disabled unchecked" disabled></stamp-checkbox>
      <stamp-checkbox label="Disabled checked" checked disabled></stamp-checkbox>
    </div>
  `,
};

export const SelectAllPattern: Story = {
  name: 'Select-all pattern',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'A parent "select all" checkbox uses indeterminate state when some (not all) children are checked. This is the canonical ARIA pattern for tree selection.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <stamp-checkbox label="Select all" indeterminate style="font-weight: 600;"></stamp-checkbox>
      <div style="padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
        <stamp-checkbox label="Option A" checked></stamp-checkbox>
        <stamp-checkbox label="Option B"></stamp-checkbox>
        <stamp-checkbox label="Option C" checked></stamp-checkbox>
      </div>
    </div>
  `,
};
