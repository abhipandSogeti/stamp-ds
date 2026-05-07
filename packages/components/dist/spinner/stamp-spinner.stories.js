import { html } from 'lit';
import './stamp-spinner.js';
const meta = {
    title: 'Components/Spinner',
    component: 'stamp-spinner',
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg'],
            table: { defaultValue: { summary: 'md' }, category: 'Appearance' },
        },
        label: {
            description: 'Accessible announcement text (sets aria-label). Screen readers announce this when the spinner appears.',
            control: 'text',
            table: { defaultValue: { summary: 'Loading' }, category: 'Accessibility' },
        },
    },
    args: {
        size: 'md',
        label: 'Loading',
    },
};
export default meta;
export const Playground = {
    name: '▶ Playground',
    render: (args) => html `
    <stamp-spinner size=${args.size ?? 'md'} label=${args.label ?? 'Loading'}></stamp-spinner>
  `,
};
export const AllSizes = {
    name: '📏 All Sizes',
    parameters: { controls: { disable: true } },
    render: () => html `
    <div style="display: flex; gap: 1.5rem; align-items: center;">
      <stamp-spinner size="sm" label="Loading small"></stamp-spinner>
      <stamp-spinner size="md" label="Loading medium"></stamp-spinner>
      <stamp-spinner size="lg" label="Loading large"></stamp-spinner>
    </div>
  `,
};
export const InContext = {
    name: 'In context — overlay',
    parameters: { controls: { disable: true } },
    render: () => html `
    <div style="
      position: relative;
      width: 240px; height: 120px;
      background: var(--stamp-color-surface-elevated, #fff);
      border-radius: 12px;
      border: 1px solid var(--stamp-color-border-default, #dde2ec);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="
        position: absolute; inset: 0;
        background: rgba(255,255,255,0.8);
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
      ">
        <stamp-spinner size="lg"></stamp-spinner>
      </div>
      <span style="font-family: Inter, sans-serif; color: #6B7280; font-size: 14px;">Content loading…</span>
    </div>
  `,
};
//# sourceMappingURL=stamp-spinner.stories.js.map