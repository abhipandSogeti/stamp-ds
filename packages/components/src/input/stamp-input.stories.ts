import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { StampInput } from './stamp-input.js';
import './stamp-input.js';

const meta: Meta<StampInput> = {
  title: 'Components/Input',
  component: 'stamp-input' as unknown as typeof StampInput,
  tags: ['autodocs'],

  argTypes: {
    label: {
      description: 'Visible label text. Associates with the input via for/id.',
      control: 'text',
      table: { category: 'Content' },
    },
    placeholder: {
      description: 'Placeholder shown when value is empty.',
      control: 'text',
      table: { category: 'Content' },
    },
    value: {
      description: 'Current input value (reflects user typing).',
      control: 'text',
      table: { category: 'Content' },
    },
    helper: {
      description: 'Helper text shown below the input. Hidden when error is set.',
      control: 'text',
      table: { category: 'Content' },
    },
    error: {
      description: 'Error message. When set, border turns red and role="alert" is added.',
      control: 'text',
      table: { category: 'State' },
    },
    type: {
      description: 'Native input type.',
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      table: { defaultValue: { summary: 'text' }, category: 'HTML' },
    },
    required: {
      description: 'Marks field as required. Adds * to label and aria-required.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Validation' },
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
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
    size: 'md',
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<StampInput>;

export const Playground: Story = {
  name: 'Playground',
  render: (args) => html`
    <stamp-input
      style="width: 320px"
      label=${args.label ?? ''}
      placeholder=${args.placeholder ?? ''}
      type=${args.type ?? 'text'}
      value=${args.value ?? ''}
      helper=${args.helper ?? ''}
      error=${args.error ?? ''}
      size=${args.size ?? 'md'}
      ?required=${args.required}
      ?disabled=${args.disabled}
    ></stamp-input>
  `,
};

export const WithHelper: Story = {
  name: 'With helper text',
  args: { label: 'Username', placeholder: 'johndoe', helper: '3–20 characters, letters and numbers only.' },
  render: (args) => html`
    <stamp-input style="width: 320px" label=${args.label} placeholder=${args.placeholder} helper=${args.helper}></stamp-input>
  `,
};

export const WithError: Story = {
  name: 'Error state',
  args: { label: 'Email', placeholder: 'you@example.com', value: 'not-an-email', error: 'Please enter a valid email address.' },
  parameters: {
    docs: {
      description: {
        story: 'The error prop replaces helper text and adds role="alert" so screen readers announce the error immediately.',
      },
    },
  },
  render: (args) => html`
    <stamp-input style="width: 320px" label=${args.label} placeholder=${args.placeholder} value=${args.value} error=${args.error}></stamp-input>
  `,
};

export const WithPrefixSuffix: Story = {
  name: 'Prefix & Suffix slots',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 320px;">
      <stamp-input label="Website URL">
        <span slot="prefix">https://</span>
        <span slot="suffix">.com</span>
      </stamp-input>
      <stamp-input label="Amount" type="number">
        <span slot="prefix">€</span>
      </stamp-input>
    </div>
  `,
};

export const AllStates: Story = {
  name: 'All States',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 320px;">
      <stamp-input label="Default" placeholder="Type something"></stamp-input>
      <stamp-input label="With value" value="Hello, world!"></stamp-input>
      <stamp-input label="Required" placeholder="Name" required helper="This field is required."></stamp-input>
      <stamp-input label="Error" value="bad" error="This value is invalid."></stamp-input>
      <stamp-input label="Disabled" value="Can't touch this" disabled></stamp-input>
    </div>
  `,
};
