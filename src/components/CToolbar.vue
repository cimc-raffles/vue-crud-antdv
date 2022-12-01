<script lang="ts" setup>
import { useAttrs } from "vue";
import CColumnSelect from "./CColumnSelect.vue";

const attrs: any = useAttrs();
</script>
<template>
  <div class="c-toolbar">
    <a-space>
      <template
        v-for="(item, index) in attrs?.toolbar.buttons"
        :key="item.code || index"
      >
        <a-button
          :type="item.type || 'default'"
          @click="attrs?.onToolbarButtonClick(item)"
        >
          {{ item.name }}
        </a-button>
      </template>
    </a-space>
    <a-space>
      <template v-if="attrs.columns">
        <c-column-select />
      </template>
    </a-space>
  </div>
</template>
<style scoped>
.c-toolbar {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}
</style>
