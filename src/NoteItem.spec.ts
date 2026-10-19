import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
// @ts-ignore - no type declaration for .vue modules in this project
import NoteItem from './NoteItem.vue';

function mountItem(note: any, attrs: Record<string, unknown> = {}) {
  return mount(NoteItem, { props: { note }, attrs });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('NoteItem', () => {
  it('renders title, body span and Delete button in order', () => {
    const wrapper = mountItem({ title: 'Groceries', body: 'milk, eggs' });
    const li = wrapper.element as HTMLElement;
    expect(li.tagName).toBe('LI');

    const elements: Element[] = Array.from(li.children);
    expect(elements.map((e: Element) => e.tagName)).toEqual(['STRONG', 'SPAN', 'BUTTON']);
    expect(elements[0].textContent).toBe('Groceries');
    expect(elements[1].textContent).toBe('— milk, eggs');
    expect(elements[2].textContent).toBe('Delete');

    // a single space between strong and span, nothing between span and button
    expect(elements[0].nextSibling!.nodeType).toBe(Node.TEXT_NODE);
    expect(elements[0].nextSibling!.textContent).toBe(' ');
    expect(elements[1].nextSibling).toBe(elements[2]);

    const text = wrapper.text();
    expect(text).toContain('Groceries');
    expect(text).toContain('— milk, eggs');
    expect(text).toContain('Delete');
  });

  it('renders no span or em dash for an empty-string body', () => {
    const wrapper = mountItem({ title: 'T', body: '' });
    expect(wrapper.find('strong').text()).toBe('T');
    expect(wrapper.find('span').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('—');
    expect(wrapper.find('button').text()).toBe('Delete');
  });

  it.each([undefined, null, false])('renders no span when body is %s', (body) => {
    const wrapper = mountItem({ title: 'T', body });
    expect(wrapper.find('strong').text()).toBe('T');
    expect(wrapper.find('span').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('—');
    expect(wrapper.findAll('button')).toHaveLength(1);
  });

  it('renders no span or em dash when body is 0', () => {
    const wrapper = mountItem({ title: 'T', body: 0 });
    expect(wrapper.find('span').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('—');
    expect(wrapper.find('button').text()).toBe('Delete');
  });

  it.each([{ title: '' }, {}])('renders an empty strong for empty/missing title', (note) => {
    const wrapper = mountItem({ ...note, body: 'b' });
    const strong = wrapper.find('strong');
    expect(strong.exists()).toBe(true);
    expect(strong.text()).toBe('');
    expect((wrapper.element as HTMLElement).firstElementChild).toBe(strong.element);
    expect(wrapper.find('span').text()).toBe('— b');
    expect(wrapper.find('button').text()).toBe('Delete');
  });

  it('escapes HTML-like text in title and body', () => {
    const wrapper = mountItem({ title: '<b>x</b>', body: '<b>y</b>' });
    expect(wrapper.find('b').exists()).toBe(false);
    expect(wrapper.find('strong').text()).toBe('<b>x</b>');
    expect(wrapper.find('span').text()).toBe('— <b>y</b>');
    expect((wrapper.find('strong').element as HTMLElement).innerHTML).toContain('&lt;b&gt;');
  });

  it('does not emit delete on render', () => {
    const onDelete = vi.fn();
    const wrapper = mountItem({ title: 'T', body: 'b' }, { onDelete });
    expect(wrapper.emitted('delete')).toBeUndefined();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('emits delete once per click and calls the parent listener', async () => {
    const onDelete = vi.fn();
    const wrapper = mountItem({ title: 'T', body: 'b' }, { onDelete });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('delete')).toHaveLength(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('emits delete for each of multiple clicks', async () => {
    const onDelete = vi.fn();
    const wrapper = mountItem({ title: 'T' }, { onDelete });
    const btn = wrapper.find('button');
    await btn.trigger('click');
    await btn.trigger('click');
    await btn.trigger('click');
    expect(wrapper.emitted('delete')).toHaveLength(3);
    expect(onDelete).toHaveBeenCalledTimes(3);
  });

  it('does not throw when clicked with no delete listener', async () => {
    const wrapper = mountItem({ title: 'T' });
    await expect(wrapper.find('button').trigger('click')).resolves.not.toThrow();
  });

  it('does not mutate the note and renders deterministically', () => {
    const note = Object.freeze({ title: 'T', body: 'b' });
    const a = mountItem(note);
    const b = mountItem(note);
    expect(a.html()).toBe(b.html());
    expect(note).toEqual({ title: 'T', body: 'b' });
  });

  it.each([null, undefined])('fails with a TypeError when note is %s', (note) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let caught: unknown;
    try {
      mount(NoteItem, {
        props: { note },
        global: {
          config: {
            errorHandler: (err: unknown) => {
              caught = err;
            },
          },
        },
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(TypeError);
  });
});