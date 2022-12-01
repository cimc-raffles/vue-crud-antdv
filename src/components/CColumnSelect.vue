<script lang="ts">
import { defineComponent, ref, computed, inject, toRaw } from "vue";
import { BarsOutlined } from "@ant-design/icons-vue";

import { cloneDeep } from "lodash-es";

import type { CheckboxChangeEvent } from "ant-design-vue/lib/checkbox/interface";
import type { Crud } from "../crud";

export default defineComponent({
  components: { BarsOutlined },
  setup() {
    const dropdownRef = ref<HTMLElement | null>(null);
    const dropdownVisible = ref<boolean>(false);
    const selectAll = ref<boolean | undefined>(false);

    const columns: Crud.CustomTableColumnProps[] =
      inject("__crud_columns") || [];

    const cloneColumns = cloneDeep(
      toRaw(columns).filter((column) => column.dataIndex)
    );

    const customColumns = ref<Crud.CustomTableColumnProps[]>(cloneColumns);

    const computedVisibleColumns = computed(() => {
      const visibleEntries = customColumns.value.map((column) => [
        column.dataIndex,
        column.invisible,
      ]);
      return Object.fromEntries(visibleEntries);
    });

    const indeterminate = computed(() => {
      const invisibleColumns =
        customColumns.value.filter((column) => column.invisible) || [];
      return (
        customColumns.value?.length &&
        invisibleColumns.length > 0 &&
        customColumns.value.length !== invisibleColumns.length
      );
    });

    const onShow = () => {
      dropdownVisible.value = !dropdownVisible.value;
    };

    const onChange = (column: Crud.CustomTableColumnProps) => {
      column.invisible = !column.invisible;
      selectAll.value =
        customColumns.value.length ===
        customColumns.value.filter((item) => !item.invisible).length;
    };

    const onSelectAll = (event: CheckboxChangeEvent) => {
      selectAll.value = event.target.checked;
      customColumns.value.forEach(
        (column) => (column.invisible = !event.target.checked)
      );
    };

    const onCancel = () => {
      dropdownVisible.value = false;
    };

    const onConfirm = () => {
      columns.forEach((column) => {
        if (column.dataIndex) {
          column.invisible =
            computedVisibleColumns.value[column.dataIndex as string];
        }
      });
      onCancel();
    };

    return {
      dropdownRef,
      dropdownVisible,
      indeterminate,
      selectAll,
      customColumns,
      computedVisibleColumns,
      onShow,
      onChange,
      onSelectAll,
      onConfirm,
      onCancel,
    };
  },
});
</script>
<template>
  <a-dropdown
    v-model:visible="dropdownVisible"
    :trigger="['click']"
    destroy-popup-on-hide
  >
    <a-button shape="circle" @click.prevent="onShow">
      <template #icon><bars-outlined /></template>
    </a-button>

    <template #overlay>
      <a-menu ref="dropdownRef">
        <a-menu-item>
          <a-checkbox
            :indeterminate="indeterminate"
            v-model:checked="selectAll"
            @change="onSelectAll"
          >
            <span class="c-checkall">Check all</span>
          </a-checkbox>
        </a-menu-item>
        <a-menu-divider />
        <template
          v-for="item in customColumns"
          :key="item.dataIndex || item.key"
        >
          <a-menu-item>
            <a-checkbox :checked="!item.invisible" @change="onChange(item)">
              {{ item.title || `[${item.dataIndex}]` }}
            </a-checkbox>
          </a-menu-item>
        </template>
        <a-menu-divider />
        <a-menu-item>
          <a-button size="small" type="link" @click="onConfirm">
            Confirm
          </a-button>
          <a-divider type="vertical" />
          <a-button
            class="c-button-cancel"
            size="small"
            type="text"
            @click="onCancel"
          >
            Cancel
          </a-button>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<style scoped>
.c-checkall {
  font-weight: bold;
}
</style>
