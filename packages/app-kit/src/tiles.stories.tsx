import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddTile, KindTile, Tiles } from './tiles.js';

/**
 * One thing in a place, as a tile you can walk into. Drawn as Key: a flat card in a well, its kind
 * told by its icon and word at the top (collection, folder, series, document, library) rather than
 * by its shape. Pointed at, it comes up as a soft key. Something that needs you carries the green
 * ribbon and says why; a locked tile stays, dashed and dimmed, and says why.
 */
const meta = {
  title: 'Quill/Tiles',
  component: KindTile,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-glance)' }}>{Story()}</div>],
  args: { kind: 'folder', name: 'Night roster', eyebrow: 'Folder', count: '6', needs: false, onOpen: () => undefined },
  argTypes: {
    kind: { control: 'inline-radio', options: ['collection', 'folder', 'series', 'document', 'library'] },
    onOpen: { action: 'open' },
    ring: { control: false },
  },
} satisfies Meta<typeof KindTile>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Every kind in one place, with one that needs you, one locked, and the add tile last. */
export const Place: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-wide)' }}>{Story()}</div>],
  render: () => (
    <Tiles label="In Fleet">
      <KindTile kind="collection" name="Fleet" eyebrow="Collection" count="42" onOpen={() => undefined} />
      <KindTile kind="folder" name="Night roster" eyebrow="Folder" count="6" needs needsLabel="Two swaps wait for you" onOpen={() => undefined} />
      <KindTile kind="series" name="Weekly brief" eyebrow="Series" count="18" onOpen={() => undefined} />
      <KindTile kind="document" name="Halden brief" eyebrow="Document" count="v2" state="In review" onOpen={() => undefined} />
      <KindTile kind="library" name="Finance" eyebrow="Library" owner="Department 1" onOpen={() => undefined} />
      <KindTile kind="folder" name="Payroll" eyebrow="Folder" locked="Only Finance can open it." onOpen={() => undefined} />
      <AddTile label="Add here" onPress={() => undefined} />
    </Tiles>
  ),
};
