import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { StampBadge } from './stamp-badge.js';
import './stamp-badge.js';

const meta: Meta<StampBadge> = {
  title: 'Components/Badge',
  component: 'stamp-badge' as unknown as typeof StampBadge,
  tags: ['autodocs'],

  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: ['neutral', 'brand', 'danger', 'success', 'warning'],
      table: { defaultValue: { summary: 'neutral' }, category: 'Appearance' },
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' }, category: 'Appearance' },
    },
    live: {
      description: 'Adds role="status" (live region). Set for badges whose content updates dynamically, e.g. unread count.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' }, category: 'Accessibility' },
    },
  },

  args: {
    variant: 'neutral',
    size: 'md',
    live: false,
  },
};

export default meta;
type Story = StoryObj<StampBadge>;

export const Playground: Story = {
  name: 'Playground',
  render: (args) => html`
    <stamp-badge variant=${args.variant ?? 'neutral'} size=${args.size ?? 'md'} ?live=${args.live}>
      Label
    </stamp-badge>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <stamp-badge variant="neutral">Neutral</stamp-badge>
      <stamp-badge variant="brand">Brand</stamp-badge>
      <stamp-badge variant="danger">Danger</stamp-badge>
      <stamp-badge variant="success">Success</stamp-badge>
      <stamp-badge variant="warning">Warning</stamp-badge>
    </div>
  `,
};

export const AllSizes: Story = {
  name: 'All Sizes',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: flex; gap: 0.75rem; align-items: center;">
      <stamp-badge variant="brand" size="sm">Small</stamp-badge>
      <stamp-badge variant="brand" size="md">Medium</stamp-badge>
      <stamp-badge variant="brand" size="lg">Large</stamp-badge>
    </div>
  `,
};

export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <span style="font-size: 14px; font-family: Inter, sans-serif;">Notifications</span>
      <stamp-badge variant="danger" live>12</stamp-badge>
    </div>
  `,
};
