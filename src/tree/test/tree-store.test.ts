import { describe, it, expect, beforeEach } from 'vitest';
import { TreeStore } from '../domain/TreeStore';
import { TreeStoreItem } from '../domain/TreeStoreItem';
import type { ITreeStoreItem } from '../domain/TreeStoreItem';

const testItems: ITreeStoreItem[] = [
  { id: 1, parent: undefined, label: 'Item 1' },
  { id: '2', parent: 1, label: 'Item 2' },
  { id: 3, parent: 1, label: 'Item 3' },
  { id: 4, parent: '2', label: 'Item 4' },
  { id: 5, parent: '2', label: 'Item 5' },
  { id: 6, parent: '2', label: 'Item 6' },
  { id: 7, parent: 4, label: 'Item 7' },
  { id: 8, parent: 4, label: 'Item 8' },
];

describe('TreeStoreItem', () => {
  it('creates an item with id, label and no parent by default', () => {
    const item = new TreeStoreItem(1, 'Item 1');

    expect(item.id).toBe(1);
    expect(item.label).toBe('Item 1');
    expect(item.parent).toBeUndefined();
    expect(item.children.size).toBe(0);
  });

  it('addChild adds a child to children and sets its parent', () => {
    const parent = new TreeStoreItem(1, 'Parent');
    const child = new TreeStoreItem(2, 'Child');

    parent.addChild(child);

    expect(parent.children.get(2)).toBe(child);
    expect(child.parent).toBe(parent);
  });

  it('getAllChildren returns an empty array when there are no children', () => {
    const item = new TreeStoreItem(1, 'Item');

    expect(item.getAllChildren()).toEqual([]);
  });

  it('getAllChildren recursively collects descendants at every level', () => {
    const root = new TreeStoreItem(1, 'Root');
    const child = new TreeStoreItem(2, 'Child');
    const grandchild = new TreeStoreItem(3, 'Grandchild');
    const greatGrandchild = new TreeStoreItem(4, 'GreatGrandchild');

    root.addChild(child);
    child.addChild(grandchild);
    grandchild.addChild(greatGrandchild);

    const result = root.getAllChildren();

    expect(result).toEqual([child, grandchild, greatGrandchild]);
  });

  it('getAllChildren includes every descendant of a branching tree', () => {
    const root = new TreeStoreItem(1, 'Root');
    const childA = new TreeStoreItem(2, 'A');
    const childB = new TreeStoreItem(3, 'B');
    const grandchild = new TreeStoreItem(4, 'A1');

    root.addChild(childA);
    root.addChild(childB);
    childA.addChild(grandchild);

    const result = root.getAllChildren();

    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining([childA, childB, grandchild]));
  });
});

describe('TreeStore', () => {
  let store: TreeStore;

  beforeEach(() => {
    store = new TreeStore(testItems);
  });

  describe('getAll', () => {
    it('returns the full array of items', () => {
      const all = store.getAll();

      expect(all).toHaveLength(testItems.length);
      expect(all.map(i => i.id)).toEqual(expect.arrayContaining(testItems.map(i => i.id)));
    });
  });

  describe('getItem', () => {
    it('returns an item by id', () => {
      const item = store.getItem(4);

      expect(item?.id).toBe(4);
      expect(item?.label).toBe('Item 4');
    });

    it('returns undefined for a non-existent id', () => {
      expect(store.getItem(999)).toBeUndefined();
    });
  });

  describe('getChildren', () => {
    it('returns the direct children of an item', () => {
      const children = store.getChildren('2');

      expect(children.map(i => i.id).sort()).toEqual([4, 5, 6].sort());
    });

    it('returns an empty array when there are no children', () => {
      expect(store.getChildren(7)).toEqual([]);
    });

    it('returns an empty array for a non-existent id', () => {
      expect(store.getChildren(999)).toEqual([]);
    });
  });

  describe('getAllChildren', () => {
    it('returns every descendant at all levels', () => {
      const all = store.getAllChildren(1);

      expect(all.map(i => i.id).sort()).toEqual(['2', 3, 4, 5, 6, 7, 8].sort());
    });

    it('returns an empty array when there are no children', () => {
      expect(store.getAllChildren(7)).toEqual([]);
    });

    it('returns an empty array for a non-existent id', () => {
      expect(store.getAllChildren(999)).toEqual([]);
    });
  });

  describe('getAllParents', () => {
    it('returns the parent chain from the item up to the root, inclusive', () => {
      const parents = store.getAllParents(7);

      expect(parents.map(i => i.id)).toEqual([7, 4, '2', 1]);
    });

    it('returns an array with a single item for the root item', () => {
      const parents = store.getAllParents(1);

      expect(parents.map(i => i.id)).toEqual([1]);
    });

    it('returns an empty array for a non-existent id', () => {
      expect(store.getAllParents(999)).toEqual([]);
    });
  });

  describe('setItems', () => {
    it('fully replaces the data in the store', () => {
      const newItems: ITreeStoreItem[] = [
        { id: 'a', parent: undefined, label: 'A' },
        { id: 'b', parent: 'a', label: 'B' },
      ];

      store.setItems(newItems);

      expect(store.getAll()).toHaveLength(2);
      expect(store.getItem(1)).toBeUndefined();
      expect(store.getItem('b')?.parent?.id).toBe('a');
    });
  });

  describe('addItem', () => {
    it('adds a new root item', () => {
      store.addItem({ id: 100, parent: undefined, label: 'New' });

      const item = store.getItem(100);
      expect(item).toBeDefined();
      expect(item?.parent).toBeUndefined();
      expect(store.getAll()).toHaveLength(testItems.length + 1);
    });

    it('adds a new child item and links it to its parent', () => {
      store.addItem({ id: 100, parent: 1, label: 'New child' });

      const item = store.getItem(100);
      expect(item?.parent?.id).toBe(1);
      expect(store.getChildren(1).map(i => i.id)).toContain(100);
    });
  });

  describe('removeItem', () => {
    it('removes an item and all of its descendants', () => {
      store.removeItem('2');

      expect(store.getItem('2')).toBeUndefined();
      expect(store.getItem(4)).toBeUndefined();
      expect(store.getItem(5)).toBeUndefined();
      expect(store.getItem(6)).toBeUndefined();
      expect(store.getItem(7)).toBeUndefined();
      expect(store.getItem(8)).toBeUndefined();
      expect(store.getAll()).toHaveLength(2);
    });

    it('detaches the removed item from its parent children list', () => {
      store.removeItem('2');

      expect(store.getChildren(1).map(i => i.id)).not.toContain('2');
    });

    it('does nothing for a non-existent id', () => {
      const before = store.getAll().length;

      store.removeItem(999);

      expect(store.getAll()).toHaveLength(before);
    });
  });

  describe('updateItem', () => {
    it('updates the item label', () => {
      store.updateItem({ id: 3, parent: 1, label: 'Updated' });

      expect(store.getItem(3)?.label).toBe('Updated');
    });

    it('moves the item to a new parent', () => {
      store.updateItem({ id: 3, parent: '2', label: 'Item 3' });

      expect(store.getItem(3)?.parent?.id).toBe('2');
      expect(store.getChildren(1).map(i => i.id)).not.toContain(3);
      expect(store.getChildren('2').map(i => i.id)).toContain(3);
    });

    it('makes the item a root item when parent === undefined', () => {
      store.updateItem({ id: 3, parent: undefined, label: 'Item 3' });

      expect(store.getItem(3)?.parent).toBeUndefined();
      expect(store.getChildren(1).map(i => i.id)).not.toContain(3);
    });

    it('does nothing for a non-existent id', () => {
      store.updateItem({ id: 999, parent: undefined, label: 'No such item' });

      expect(store.getItem(999)).toBeUndefined();
    });
  });
});
