<script setup lang="ts">
import { TreeStore } from '@/tree/domain/TreeStore';
import TreeGridView from './tree/ui/TreeGridView.vue';
import { ref, shallowRef } from 'vue';

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
</script>

<template>
  <div class="app">
    <TreeGridView
      class="grid"
      :data="treeStore"
      :loading="pending"
    />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
}
.grid {
  width: 100%;
  height: 100%;
}
</style>
