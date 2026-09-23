<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { TreeStore } from '@/tree/domain/TreeStore';
import { computed, ref, type UnwrapRef } from 'vue';

ModuleRegistry.registerModules([AllCommunityModule, RowGroupingModule, TreeDataModule]);

const props = defineProps<{
  data: UnwrapRef<TreeStore>;
  loading: boolean;
}>();

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

const rowData = computed<IRow[]>(() => props.data.getAll().map((item, i) => ({
  n: i + 1,
  label: item.label,
  category: item.children.size ? 'Группа' : 'Элемент',
  path: [...props.data.getAllParents(item.id)]
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
  <AgGridVue
    class="grid"
    :column-defs="colDefs"
    :row-data="rowData"
    :loading="loading"
    :tree-data="true"
    :get-data-path="getDataPath"
    :auto-group-column-def="autoGroupColumnDef"
    @grid-ready="onGridReady"
  />
</template>
