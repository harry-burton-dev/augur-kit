import type { Meta, StoryObj } from '@storybook/react-vite';
import { Notice } from '@augur/kit-common';
import { Grid, Split, Stack } from './layout.js';

/**
 * Layout inside an app's main column: Stack, Split and Grid. The shell lays out and pads the pane; these
 * place what is in it, spaced only by the layout tokens, so an app chooses how things sit together and
 * never a distance. On the app contract they are `quill-stack`, `quill-split` and `quill-grid`.
 */
const meta = {
  title: 'Quill/Frame/Layout',
  component: Stack,
  tags: ['autodocs'],
  args: { gap: 'normal' },
} satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;

const part = (heading: string, body?: string) => <Notice heading={heading}>{body}</Notice>;

/** Children one above the other. `gap` is tight, normal, loose or section. */
export const Stacked: Story = { render: (args) => <Stack {...args}>{part('First')}{part('Second')}{part('Third')}</Stack> };

/** Sections of a screen, the widest gap. */
export const Sections: Story = { args: { gap: 'section' }, render: (args) => <Stack {...args}>{part('Needs you', 'Two documents to review')}{part('New since you looked')}</Stack> };

/** A main part and an aside. Make the canvas narrow and the aside goes under the main part by itself. */
export const MainAndAside: Story = {
  render: () => (
    <Split aside={part('Beside it', 'At least part-min-width wide')}>
      {part('The main part', 'Takes the rest of the width')}
    </Split>
  ),
};

/** As many columns as fit, each at least part-min-width wide. */
export const GridOfParts: Story = {
  render: () => (
    <Grid label="Floors">
      {part('Personal')}
      {part('Claims team')}
      {part('Operations')}
      {part('Organisation')}
    </Grid>
  ),
};
