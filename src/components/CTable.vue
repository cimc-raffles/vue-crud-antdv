<script lang="ts">
import {
  defineComponent,
  h,
  ref,
  reactive,
  watch,
  toRaw,
  inject,
  computed,
  renderSlot,
} from "vue";
import type { PropType } from "vue";

import CField from "./CField.vue";

import { cloneDeep } from "lodash-es";

import { useRequest, usePagination } from "../utils/request";
import useCellDisplayValue from "../utils/cellRender";
import { pluginKey } from "../utils/key";

import { Crud } from "../crud";
import type { ColumnType } from "ant-design-vue/lib/table/interface";

export default defineComponent({
  props: {
    dataSource: {
      type: Array as PropType<Record<string, any>[]>,
    },
    columns: {
      type: Array as PropType<Crud.CustomTableColumnProps[]>,
      default: () => [],
    },
    rowSelection: {
      type: [Boolean, Object],
    },
    proxyConfig: {
      type: Object as PropType<Crud.ProxyConfigProps>,
    },
  },
  setup(props, { attrs, slots }) {
    //plugin
    const pluginProps = inject<Crud.TablePluginProps>(pluginKey);
    const customTypeRenderPlugins: { [key: string]: any } = {};

    const tableRef = ref(null);

    //origin data source
    const originalDataSource = ref<Record<string, any>>();

    //[dataIndex,rowIndex];
    const currentEditableCell = reactive<[string, number] | []>([]);
    const computedDataSource = ref<Record<string, any>[]>([]);

    const isCurrentCell = (columnDataIndex: string, rowIndex: number) =>
      currentEditableCell.length &&
      currentEditableCell[0] === columnDataIndex &&
      currentEditableCell[1] === rowIndex;

    watch(
      () => props.dataSource,
      (value) => {
        computedDataSource.value = value || [];
      }
    );

    //row key
    const computedRowKey = computed<string | Function>(() => {
      return (
        (attrs["row-key"] as string) ||
        (attrs.rowKey as string) ||
        ((record: { id?: string; key?: string }) => record.id || record.key)
      );
    });

    //proxy result
    const result = reactive<Crud.ProxyResult>({
      query: { dataSource: undefined },
      save: { dataSource: undefined },
      delete: { dataSource: undefined },
    });

    watch(
      () => result.query.dataSource,
      (value) => {
        computedDataSource.value = value;
      }
    );
    watch(
      () => result.save.dataSource,
      (value) => {
        computedDataSource.value = value;
      }
    );
    watch(
      () => result.delete.dataSource,
      (value) => (computedDataSource.value = value)
    );

    //loading
    const computedLoading = computed(
      () => result.query.loading || result.save.loading || result.delete.loading
    );

    //pagination
    const computedPagination = computed(() => result.query.pagination);

    //on change
    const onChange = (args: any) => {
      result.query?.onPaginationChange(args);
      // @ts-ignore
      attrs?.onChange?.(args);
    };

    //proxy config
    const commitProxy = (code: string | number, args: any) => {
      switch (code) {
        case "save":
          //TODO: arguments
          result?.[code]?.run(computedDataSource.value);
          break;
        case "delete":
          //TODO:
          break;
        default:
          result?.[code]?.run(args);
          break;
      }
    };

    if (props.proxyConfig?.ajax) {
      const {
        query: queryFunction,
        save: saveFunction,
        delete: deleteFunction,
      } = props.proxyConfig.ajax;

      //query
      if (queryFunction) {
        result.query = usePagination(queryFunction, {
          manual: !(
            props.proxyConfig.autoLoad === undefined ||
            props.proxyConfig.autoLoad
          ),
        });
      }

      //save
      if (saveFunction) {
        result.save = useRequest(saveFunction, { manual: true });
      }

      //delete
      if (deleteFunction) {
        result.delete = useRequest(deleteFunction, { manual: true });
      }
    }

    const selectedRowKeys = ref<string[]>([]);

    //row selection
    const getRowSelection = (type = "checkbox") => ({
      onChange: (selectedKeys: string[]) => {
        selectedRowKeys.value = selectedKeys;
      },
      selectedRowKeys,
      type,
      allowCancelRadio: true,
    });

    //default props
    const defaultProps = {
      size: "small",
      bordered: true,
      rowSelection: props.rowSelection === true ? getRowSelection() : undefined,
      scroll: { x: "max-content" },
      onResizeColumn: (width: any, column: { width: any }) => {
        column.width = width;
      },
    };

    const defaultColumnProps = {
      resizable: true,
      drag: true,
      ellipsis: true,
      sorter: true,
      editable: false,
      formatter: false,
      width: 100,
    };

    const getCellDisplayValue = ({
      text,
      index,
      column,
    }: {
      text: string;
      index: number;
      column: Crud.CustomTableColumnProps;
    }) => {
      return useCellDisplayValue({ text, index, column }, computedDataSource);
    };

    const customCell = (
      _: unknown,
      rowIndex: number | undefined,
      column: ColumnType<any> | undefined
    ) => {
      return {
        onClick: () => {
          if (column?.dataIndex && rowIndex !== undefined)
            currentEditableCell.splice(
              0,
              2,
              column.dataIndex as string,
              rowIndex
            );
        },
      };
    };

    const getCustomRender = (
      column: Crud.CustomTableColumnProps,
      displayRender?: Crud.CustomNodeRender,
      editorRender?: Crud.CustomNodeRender,
      customRenderClass?: Crud.CustomRenderClass
    ) => {
      return (args: Crud.CustomRenderProps) => {
        const { text, record, index } = args;
        const { defaultValue, displayValue } = getCellDisplayValue(args);
        return [
          column.editable && isCurrentCell(column.dataIndex as string, index)
            ? editorRender?.(
                args,
                column,
                computedDataSource,
                customRenderClass
              ) ||
              //@ts-ignore
              h(CField, {
                type: column.type,
                options: {
                  defaultValue,
                  ["onUpdate:value"]: (value: any) => {
                    if (!originalDataSource.value)
                      originalDataSource.value = cloneDeep(
                        computedDataSource.value
                      );
                    // @ts-ignore
                    record[column.dataIndex] = value;
                  },
                  size: "small",
                  ...column.options,
                },
              })
            : displayRender?.(
                args,
                column,
                computedDataSource,
                customRenderClass
              ) || displayValue,
        ];
      };
    };

    const computedColumns = computed(() => {
      const { columns } = props;
      //visible
      const visibleColumns = columns.filter((column) => {
        if (column.type && ["radio", "checkbox"].includes(column.type)) {
          defaultProps.rowSelection = getRowSelection(column.type);
          return false;
        }
        return (
          !column.invisible && column.visible !== false && !column.hideInTable
        );
      });
      const size = visibleColumns.length;
      return visibleColumns.map((column, index) => {
        //index
        if (column.type === "index") {
          column.customRender = ({ index }) => 1 + index;
          column.width = column.width || 50;
          column.align = column.align || "center";
          return column;
        }
        //resize
        if (1 + index !== size && !column.resizable)
          column.resizable = defaultColumnProps.resizable;
        if (column.resizable && !column.width)
          column.width = defaultColumnProps.width;
        //sort
        if (!column.sorter) column.sorter = defaultColumnProps.sorter;
        //ellipsis
        if (!column.ellipsis) column.ellipsis = defaultColumnProps.ellipsis;
        //drag
        if (!column.drag) column.drag = defaultColumnProps.drag;
        //formatter
        if (column.formatter && !column.customRender) {
          // Function({text, value, record, index, column}) {}
          column.customRender = (args: { text: any; record: unknown }) => {
            return column.formatter!({
              ...args,
              cellValue: args.text,
              row: args.record,
            });
          };
        }
        //type
        if (column.type && !column.editable)
          column.customRender = (args: Crud.CustomRenderProps) =>
            getCellDisplayValue(args).displayValue;
        //edit
        if (column.editable && !column.scopedSlots) {
          column.customCell = customCell;
          column.customRender = getCustomRender(column);
        }
        //slot
        if (
          column.scopedSlots?.customRender &&
          !column.scopedSlots?.customEditorRender
        ) {
          column.customRender = (args) =>
            renderSlot(slots, column.scopedSlots!.customRender!, args);
        }
        if (column.scopedSlots?.customEditorRender) {
          column.customCell = customCell;
          column.customRender = getCustomRender(
            column,
            column.scopedSlots?.customRender
              ? (args: Crud.CustomRenderProps) =>
                  renderSlot(slots, column.scopedSlots!.customRender!, {
                    ...args,
                  })
              : undefined,
            (args: Crud.CustomRenderProps) =>
              renderSlot(slots, column.scopedSlots!.customEditorRender!, {
                ...args,
              })
          );
        }

        //plugin
        if (column.type && pluginProps?.customType?.[column.type]) {
          const customNodeRender = pluginProps.customType?.[column.type];
          if (customNodeRender) {
            column.customCell = customCell;
            const customNodeRenderClass =
              customTypeRenderPlugins[column.type] ||
              new customNodeRender(column);
            if (!customTypeRenderPlugins[column.type])
              customTypeRenderPlugins[column.type] = customNodeRenderClass;
            column.customRender = getCustomRender(
              column,
              customNodeRenderClass?.displayRender,
              customNodeRenderClass?.editorRender,
              customNodeRenderClass
            );
          }
        }

        return column;
      });
    });

    const getCheckboxRecords = () => {
      if (!selectedRowKeys.value?.length) return [];
      const selectedRows = toRaw(computedDataSource.value).filter(
        (record: Record<string, any>) => {
          const key = computedRowKey.value;
          const value = key instanceof Function ? key(record) : record[key];
          return selectedRowKeys.value.includes(value);
        }
      );
      return selectedRows;
    };

    const getUpdateRecords = () => {
      //TODO:
    };

    const getInsertRecords = () => {
      //TODO:
    };

    const toggleCheckboxRow = (record: Record<string, any>) => {
      const key = computedRowKey.value;
      const value = key instanceof Function ? key(record) : record[key];
      const index = selectedRowKeys.value.findIndex((item) => item === value);
      if (index < 0) selectedRowKeys.value.push(value);
      else selectedRowKeys.value.splice(index, 1);
    };

    //file chooser
    let fileInput: HTMLInputElement | null = null;
    const readFile = ({
      multiple,
      types,
    }: {
      multiple: boolean;
      types: string[];
    }) => {
      if (!fileInput) fileInput = document.createElement("input");
      fileInput.name = "file";
      fileInput.type = "file";
      return new Promise((resolve, reject) => {
        if (fileInput == null) reject(null);
        else {
          fileInput.multiple = !!multiple;
          if (types?.length && !types.includes("*"))
            fileInput.accept = `.${types.join(", .")}`;
          fileInput.onchange = ({ target }) => {
            const { files } = target as HTMLInputElement;
            resolve({ files, file: files?.[0] });
          };
          fileInput.click();
        }
      });
    };

    const reloadData = (data: Record<string, any>[]) => {
      computedDataSource.value = data;
    };

    const reloadColumn = (columns: Crud.CustomTableColumnProps[]) => {
      props.columns.splice(0, props.columns.length, ...columns);
    };

    const insert = (record: Record<string, any>) => {
      computedDataSource.value.unshift(record);
    };

    const insertAt = (record: Record<string, any>, index: number) => {
      computedDataSource.value.splice(index, 0, record);
    };

    const getRowById = (id: string) => {
      const key = computedRowKey.value;
      return toRaw(computedDataSource.value).find(
        (record: Record<string, any>) => {
          return key instanceof Function
            ? key(record) === id
            : record[key] === id;
        }
      );
    };

    const getData = (index: number | undefined) => {
      return Number.isInteger(index)
        ? computedDataSource.value[index as number]
        : computedDataSource.value;
    };

    const computedAttrs = computed(() => {
      return { ...defaultProps, ...attrs, onChange };
    });

    return {
      computedDataSource,
      computedColumns,
      computedLoading,
      computedPagination,
      computedRowKey,
      computedAttrs,
      selectedRowKeys,
      commitProxy,
      getRowById,
      getCheckboxRecords,
      getUpdateRecords,
      getInsertRecords,
      toggleCheckboxRow,
      insert,
      insertAt,
      readFile,
      reloadData,
      reloadColumn,
      getData,
      tableRef,
    };
  },
});
</script>

<template>
  <div class="c-table">
    <a-table
      :row-key="computedRowKey"
      :data-source="computedDataSource"
      :columns="computedColumns"
      :loading="computedLoading || $attrs.loading"
      :pagination="computedPagination"
      v-bind="computedAttrs"
    ></a-table>
  </div>
</template>
<style scoped>
.c-table :deep(.ant-select) {
  width: 100%;
}
</style>
