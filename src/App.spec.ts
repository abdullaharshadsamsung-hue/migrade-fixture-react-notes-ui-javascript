import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

type Note = { id: number; title: string; body: string };
type NotesModule = {
  initialNotes: Note[];
  addNote: (notes: Note[], title: string) => Note[];
  removeNote: (notes: Note[], id: number) => Note[];
};

const mockState = vi.hoisted(() => ({ initial: null as Note[] | null }));

vi.mock('./notes.js', async (importOriginal) => {
  const actual = (await importOriginal()) as NotesModule;
  return {
    ...actual,
    get initialNotes() {
      return mockState.initial ?? actual.initialNotes;
    },
    addNote: vi.fn(actual.addNote),
    removeNote: vi.fn(actual.removeNote),
  };
});

// @ts-ignore - JS module without type declarations
import * as notesModuleRaw from './notes.js';
// @ts-ignore - Vue SFC without type declarations
import NoteItemRaw from './NoteItem.vue';

const notesModule = notesModuleRaw as unknown as NotesModule;
const NoteItem = NoteItemRaw as any;

const defaultNotes: Note[] = [
  { id: 1, title: 'Buy milk', body: 'Two litres' },
  { id: 2, title: 'Call Sam', body: 'About the trip' },
];

async function mountApp(initial?: Note[] | null): Promise<any> {
  mockState.initial = initial ?? null;
  vi.resetModules();
  // @ts-ignore - Vue SFC without type declarations
  const mod: any = await import('./App.vue');
  return mount(mod.default);
}

function inputValue(w: any): string {
  return (w.element as HTMLInputElement).value;
}

describe('App', () => {
  beforeEach(() => {
    mockState.initial = null;
    vi.clearAllMocks();
  });

  it('renders initial structure', async () => {
    const w = await mountApp();
    expect(w.find('main').exists()).toBe(true);
    expect(w.find('h1').text()).toBe('Notes');
    const input = w.find('form input');
    expect(input.attributes('placeholder')).toBe('New note');
    expect(inputValue(input)).toBe('');
    const btn = w.find('form button[type="submit"]');
    expect(btn.text()).toBe('Add');
    const items = w.findAll('ul li');
    expect(items).toHaveLength(2);
    expect(items[0].find('strong').text()).toBe('Buy milk');
    expect(items[1].find('strong').text()).toBe('Call Sam');
    expect(w.find('p').text()).toBe('2 notes');
  });

  it('passes note objects to NoteItem', async () => {
    const w = await mountApp();
    const items = w.findAllComponents(NoteItem);
    expect(items.map((i: any) => i.props('note'))).toEqual(defaultNotes);
  });

  it('renders empty list when initialNotes is empty', async () => {
    const w = await mountApp([]);
    expect(w.findAll('ul li')).toHaveLength(0);
    expect(w.find('p').text()).toBe('0 notes');
  });

  it('shows "1 notes" with one note', async () => {
    const w = await mountApp([{ id: 5, title: 'Solo', body: '' }]);
    expect(w.findAll('ul li')).toHaveLength(1);
    expect(w.find('p').text()).toBe('1 notes');
  });

  it('typing updates input without changing notes', async () => {
    const w = await mountApp();
    const input = w.find('input');
    await input.setValue('Buy milk');
    expect(inputValue(input)).toBe('Buy milk');
    expect(w.findAll('ul li')).toHaveLength(2);
    expect(w.find('p').text()).toBe('2 notes');
    expect(notesModule.addNote).not.toHaveBeenCalled();
  });

  it('submitting adds a note, clears input and prevents default', async () => {
    const w = await mountApp();
    const input = w.find('input');
    await input.setValue('Buy milk');
    const event = new Event('submit', { cancelable: true, bubbles: true });
    w.find('form').element.dispatchEvent(event);
    await nextTick();
    expect(event.defaultPrevented).toBe(true);
    expect(notesModule.addNote).toHaveBeenCalledWith(defaultNotes, 'Buy milk');
    const items = w.findAll('ul li');
    expect(items).toHaveLength(3);
    expect(items[2].find('strong').text()).toBe('Buy milk');
    expect(w.find('p').text()).toBe('3 notes');
    expect(inputValue(input)).toBe('');
  });

  it('trims title on submit', async () => {
    const w = await mountApp();
    await w.find('input').setValue('  Walk dog  ');
    await w.find('form').trigger('submit');
    expect(w.findAll('ul li')[2].find('strong').text()).toBe('Walk dog');
  });

  it.each(['', '   '])('blank title %j is ignored but input cleared', async (t) => {
    const w = await mountApp();
    const input = w.find('input');
    await input.setValue(t);
    const event = new Event('submit', { cancelable: true, bubbles: true });
    w.find('form').element.dispatchEvent(event);
    await nextTick();
    expect(event.defaultPrevented).toBe(true);
    expect(notesModule.addNote).toHaveBeenCalledWith(defaultNotes, t);
    expect(w.findAll('ul li')).toHaveLength(2);
    expect(w.find('p').text()).toBe('2 notes');
    expect(inputValue(input)).toBe('');
  });

  it('deleting a note removes it and keeps the others', async () => {
    const w = await mountApp();
    await w.find('input').setValue('draft');
    await w.findAll('ul li')[0].find('button').trigger('click');
    expect(notesModule.removeNote).toHaveBeenCalledWith(defaultNotes, 1);
    const items = w.findAll('ul li');
    expect(items).toHaveLength(1);
    expect(items[0].find('strong').text()).toBe('Call Sam');
    expect(w.find('p').text()).toBe('1 notes');
    expect(inputValue(w.find('input'))).toBe('draft');
  });

  it('delete emitted from NoteItem removes the correct note', async () => {
    const w = await mountApp();
    w.findAllComponents(NoteItem)[1].vm.$emit('delete');
    await nextTick();
    expect(notesModule.removeNote).toHaveBeenCalledWith(defaultNotes, 2);
    expect(w.findAll('ul li').map((l: any) => l.find('strong').text())).toEqual(['Buy milk']);
  });

  it('count always matches rendered items through add and delete', async () => {
    const w = await mountApp();
    const check = () =>
      expect(w.find('p').text()).toBe(`${w.findAll('ul li').length} notes`);
    check();
    await w.find('input').setValue('A');
    await w.find('form').trigger('submit');
    check();
    await w.findAll('ul li')[0].find('button').trigger('click');
    check();
    await w.findAll('ul li')[0].find('button').trigger('click');
    await w.findAll('ul li')[0].find('button').trigger('click');
    check();
    expect(w.find('p').text()).toBe('0 notes');
  });

  it('remount restores initial notes', async () => {
    const w = await mountApp();
    await w.findAll('ul li')[0].find('button').trigger('click');
    w.unmount();
    const w2 = await mountApp();
    expect(w2.findAll('ul li')).toHaveLength(2);
  });
});