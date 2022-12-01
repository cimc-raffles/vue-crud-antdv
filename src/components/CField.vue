<script lang="ts">
import { defineComponent, computed, h, Component } from "vue";
import {
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  RangePicker,
} from "ant-design-vue";

import type { PropType } from "vue";
import type { Crud } from "../crud";

const defaultProps = { allowClear: true };

const defaultComponentMap: { [key: string]: [Component, Record<string, any>] } =
  {
    input: [Input, {}],
    select: [
      Select,
      {
        showSearch: true,
        filterOption: (input: string, option: { label: string }) => {
          return option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
    ],
    textarea: [Input.TextArea, {}],
    date: [DatePicker, { valueFormat: "YYYY-MM-DD" }],
    time: [TimePicker, {}],
    datetime: [
      DatePicker,
      { showTime: true, valueFormat: "YYYY-MM-DD HH:mm:ss" },
    ],
    week: [DatePicker, { picker: "week" }],
    month: [DatePicker, { picker: "month" }],
    quarter: [DatePicker, { picker: "quarter" }],
    year: [DatePicker, { picker: "year" }],
    range: [RangePicker, {}],
  };

export default defineComponent({
  props: {
    value: {},
    type: {
      type: String as PropType<Crud.CustomColumnType>,
      default: "input",
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    record: {
      type: Object,
    },
    renderFormItem: {
      type: Function,
    },
  },
  emits: ["update:value"],
  // eslint-disable-next-line no-unused-vars
  setup(props, { emit }) {
    const formItemContext = Form.useInjectFormItemContext();
    const node = computed(() => {
      return defaultComponentMap[props.type];
    });
    const changeEventOption = {
      ["onUpdate:value"]: (value: any) => {
        emit("update:value", value);
        formItemContext?.onFieldChange();
      },
    };

    const options = Object.assign(
      {},
      defaultProps,
      changeEventOption,
      node.value[1] || {}
    );

    return () => [
      props.renderFormItem
        ? props.renderFormItem()
        : h(node.value[0], {
            ...options,
            value: props.options?.value?.value || props.value,
            ...props.options,
          }),
    ];
  },
});
</script>
