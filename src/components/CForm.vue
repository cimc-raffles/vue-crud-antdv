<script lang="ts" setup>
import { useAttrs, useSlots, renderSlot, reactive, ref, toRaw } from "vue";
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";

import CField from "./CField.vue";
import type { Crud } from "../crud";

const { t } = useI18n();
const props = defineProps({
  columns: {
    type: Array as PropType<Crud.CustomTableColumnProps[]>,
  },
  formItemLayout: {
    type: Object,
    default: () => ({
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    }),
  },
});

const emit = defineEmits(["submit"]);
const slots = useSlots();

const formRef = ref();
const modelRef = reactive<Record<string, any>>({});

const onSubmit = (values: Record<string, any>) => {
  emit("submit", values);
};

const resetFields = () => {
  formRef.value.resetFields();
};

const renderFormItem = (item: Crud.CustomTableColumnProps) => {
  return item.renderFormItem && item.dataIndex
    ? //@ts-ignore
      () => item.renderFormItem(modelRef[item.dataIndex as string], modelRef)
    : item?.scopedSlots?.customFormRender && item.dataIndex
    ? (customOptions = {}) =>
        renderSlot(slots, item.scopedSlots!.customFormRender!, {
          value: modelRef[item.dataIndex as string],
          record: modelRef,
          ...customOptions,
        })
    : undefined;
};
</script>
<template>
  <a-form
    layout="inline"
    ref="formRef"
    :model="modelRef"
    :label-col="props.formItemLayout.labelCol"
    :wrapper-col="props.formItemLayout.wrapperCol"
    @finish="onSubmit"
  >
    <template v-for="item in columns" :key="item.dataIndex">
      <a-form-item
        :label="item.title"
        :name="item.dataIndex"
        :required="item.required"
        v-show="!(item.hideInSearch || item.hideInForm)"
      >
        <c-field
          v-model:value="modelRef[item.dataIndex as string]"
          :type="item.type"
          :options="item.options"
          :renderFormItem="renderFormItem(item)"
        >
          <template
            v-if="item?.scopedSlots?.customFormRender"
            v-slot:[item.scopedSlots!.customFormRender!]="{ value, record }"
          >
            <slot
              :name="item?.scopedSlots?.['customFormRender']"
              :value="value"
              :record="record"
            ></slot>
          </template>
        </c-field>
      </a-form-item>
    </template>
    <a-form-item>
      <a-space>
        <a-button type="primary" html-type="submit">
          {{ t("crud.submit") }}
        </a-button>
        <a-button @click="resetFields">
          {{ t("crud.reset") }}
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>
