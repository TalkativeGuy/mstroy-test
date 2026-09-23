export type TreeStoreItemId = string|number;

export interface ITreeStoreItem {
  id: TreeStoreItemId;
  parent?: string|number|null;
  label: string;
}

export class TreeStoreItem {
  id: TreeStoreItemId;
  label: string;
  parent?: TreeStoreItem;
  children: Map<TreeStoreItemId, TreeStoreItem>;

  constructor(id: TreeStoreItemId, label: string, parent?: TreeStoreItem) {
    this.id = id;
    this.label = label;
    this.parent = parent;
    this.children = new Map();
  }

  addChild(child: TreeStoreItem) {
    this.children.set(child.id, child);
    child.parent = this;
  }

  getAllChildren(): TreeStoreItem[] {
    const children = Array.from(this.children.values());
    return children.reduce(
      (result, child) => [...result, ...child.getAllChildren()],
      children
    );
  }
}
