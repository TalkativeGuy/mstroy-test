import { TreeStoreItem } from './TreeStoreItem';
import type { ITreeStoreItem, TreeStoreItemId } from './TreeStoreItem';

export class TreeStore {
  private _itemsMap = new Map<TreeStoreItemId, TreeStoreItem>();

  private _initializeItems(items: ITreeStoreItem[]) {
    items.forEach(item => {
      const treeItem = new TreeStoreItem(
        item.id,
        item.label,
        item.parent ? this._itemsMap.get(item.parent) : undefined
      );
      if (item.parent) {
        this._itemsMap.get(item.parent)?.addChild(treeItem);
      }
      this._itemsMap.set(item.id, treeItem);
    });
  }

  constructor(items: ITreeStoreItem[]) {
    this._initializeItems(items);
  }
  
  getAll() {
    return Array.from(this._itemsMap.values());
  }

  getItem(id: TreeStoreItemId) {
    return this._itemsMap.get(id);
  }

  getChildren(id: TreeStoreItemId) {
    const item = this._itemsMap.get(id);
    return item ? Array.from(item.children.values()) : [];
  }

  getAllChildren(id: TreeStoreItemId) {
    const item = this._itemsMap.get(id);
    return item ? item.getAllChildren() : [];
  }

  getAllParents(id: TreeStoreItemId) {
    const result: TreeStoreItem[] = [];
    let item = this._itemsMap.get(id);
    while (item) {
      result.push(item);
      item = item.parent;
    }
    return result;
  }

  setItems(items: ITreeStoreItem[]) {
    this._itemsMap.clear();
    this._initializeItems(items);
  }

  addItem(item: ITreeStoreItem) {
    const treeItem = new TreeStoreItem(
      item.id,
      item.label,
      item.parent ? this._itemsMap.get(item.parent) : undefined
    );
    if (item.parent) {
      this._itemsMap.get(item.parent)?.addChild(treeItem);
    }
    this._itemsMap.set(item.id, treeItem);
  }

  removeItem(id: TreeStoreItemId) {
    const item = this._itemsMap.get(id);
    if (!item) {
      return;
    }
    this.getAllChildren(id).forEach(child => this._itemsMap.delete(child.id));
    item.parent?.children.delete(item.id);
    this._itemsMap.delete(id);
  }

  updateItem(item: ITreeStoreItem) {
    const existing = this._itemsMap.get(item.id);
    if (!existing) {
      return;
    }
    existing.label = item.label;
    const newParent = item.parent ? this._itemsMap.get(item.parent) : undefined;
    if (existing.parent !== newParent) {
      existing.parent?.children.delete(existing.id);
      existing.parent = newParent;
      newParent?.children.set(existing.id, existing);
    }
  }
}
