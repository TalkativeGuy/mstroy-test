<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { TreeStore } from './tree/domain/TreeStore';
import { computed, ref } from 'vue';

ModuleRegistry.registerModules([AllCommunityModule, RowGroupingModule, TreeDataModule]);

const pending = ref(false);
const treeStore = ref<TreeStore>(new TreeStore([]));

const refresh = async () => {
  pending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const res = await fetch('/tree.json');
    treeStore.value.setItems(await res.json());
  } catch (err: any) {
    console.error(err);
  } finally {
    pending.value = false;
  }
};
refresh();

interface IRow {
  n: number;
  label: string;
  category: 'Группа' | 'Элемент';
  path: string[];
}

const colDefs = ref<ColDef<IRow>[]>([
  {
    headerName: '№ п\\п',
    width: 80,
    valueGetter: (params) => params.node ? params.node.rowIndex! + 1 : null,
  },
  { field: 'label', headerName: 'Наименование', flex: 1 },
]);

const autoGroupColumnDef = ref<ColDef<IRow>>({
  headerName: 'Категория',
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: (params: { data?: IRow }) => params.data?.category ?? '',
  },
});

const rowData = computed<IRow[]>(() => treeStore.value.getAll().map((item, i) => ({
  n: i + 1,
  label: item.label,
  category: item.children.size ? 'Группа' : 'Элемент',
  path: [...treeStore.value.getAllParents(item.id)]
    .reverse()
    .map(i => `${typeof i.id === 'number' ? 'n' : 's'}-${i.id}`),
})));

const getDataPath = (data: IRow) => data.path;

// по-другому, видимо, никак ¯\_(ツ)_/¯
const onGridReady = (event: GridReadyEvent) => {
  event.api.moveColumnByIndex(0, 1);
};
</script>

<template>
  <div>
    <AgGridVue
      class="grid"
      :column-defs="colDefs"
      :row-data="rowData"
      :loading="pending"
      :tree-data="true"
      :get-data-path="getDataPath"
      :auto-group-column-def="autoGroupColumnDef"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<style scoped>
.grid {
  width: 100%;
  height: 100vh;
}
</style>
