import type { QueryResult, Service } from "vue-request";

import type { TableColumnProps } from "ant-design-vue";

export namespace Crud {
  enum CustomColumnType {
    INDEX = "index",
    INPUT = "input",
    TEXTAREA = "textarea",
    SELECT = "select",
    DATE = "date",
    TIME = "time",
    DATETIME = "datetime",
    WEEK = "week",
    MONTH = "month",
    QUARTER = "quarter",
    YEAR = "year",
    RANGE = "range",
  }

  interface ProxyResult {
    query: QueryResult;
    save?: QueryResult;
    delete?: QueryResult;
    [key: string]: QueryResult;
  }

  interface ProxyConfigProps {
    autoLoad: boolean;
    ajax: {
      query: Service;
      save: Service;
      delete: Service;
    };
  }

  interface CustomTableColumnProps extends TableColumnProps {
    type?: CustomColumnType;
    invisible?: boolean;
    visible?: boolean;
    required?: boolean;
    editable?: boolean;
    drag?: boolean;
    options?: Record<string, any>;
    hideInSearch?: boolean;
    hideInForm?: boolean;
    hideInTable?: boolean;
    formatter?: ({}) => any;
    renderFormItem?: (
      value?: any,
      record?: Record<string, any> | undefined
    ) => VNode;
    scopedSlots?: {
      customRender?: string;
      customFormRender?: string;
      customEditorRender?: string;
    };
  }

  interface CustomRenderProps {
    text: any;
    record: unknown;
    index: number;
    column: ColumnType<unknown>;
  }

  type DataSourceRenderParameter =
    | Record<string, any>
    | Ref<Record<string, any>>;

  type CustomNodeRender = (
    CustomRenderProps,
    CustomColumnType?,
    DataSourceRenderParameter?,
    CustomRenderClass?
  ) => VNode;

  class CustomRenderClass {
    column: CustomTableColumnProps;
    constructor(column: CustomTableColumnProps);
    displayRender?: CustomNodeRender;
    editorRender?: CustomNodeRender;
  }

  interface TablePluginProps {
    customType: {
      [key: string]: {
        new (column: CustomTableColumnProps): CustomRenderClass;
      };
    };
  }
}
