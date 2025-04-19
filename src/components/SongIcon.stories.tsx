import type { Meta, StoryObj } from '@storybook/react';
import SongIcon from './SongIcon';

const meta: Meta<typeof SongIcon> = {
  title: 'Components/SongIcon',
  component: SongIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SongIcon>;

export const Default: Story = {
  args: {
    albumArtUrl: 'https://example.com/album1.jpg',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
  },
};

export const Selected: Story = {
  args: {
    ...Default.args,
    selected: true,
  },
};

export const WithLongText: Story = {
  args: {
    albumArtUrl: 'https://example.com/album2.jpg',
    title: 'This is a very long song title that should be truncated',
    artist: 'This is a very long artist name that should be truncated',
  },
};

export const WithCustomClass: Story = {
  args: {
    ...Default.args,
    className: 'bg-gray-100',
  },
}; 