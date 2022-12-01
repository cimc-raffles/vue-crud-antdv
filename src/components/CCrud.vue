<script lang="ts">
import { defineComponent, provide, ref } from "vue";
import CTable from "./CTable.vue";
import CToolbar from "./CToolbar.vue";

export default defineComponent({
  components: { CTable, CToolbar },
  setup(props, { attrs }) {
    provide("__crud_columns", attrs.columns);
    const tableRef = ref(null);
    return { tableRef, getTable: () => tableRef.value };
  },
});
</script>
<template>
  <c-toolbar
    v-if="$attrs.toolbar && $attrs.toolbar !== false"
    v-bind="$attrs"
  ></c-toolbar>
  <c-table v-bind="$attrs" ref="tableRef"></c-table>
</template>
