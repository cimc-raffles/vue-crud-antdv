import { Ref, unref } from "vue";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import type { Crud } from "../crud";

interface CustomParameter {
  text: string;
  index: number;
  column: Crud.CustomTableColumnProps;
}

const useCellDisplayValue = (
  { text, index, column }: CustomParameter,
  dataSource: Record<string, any>[] | Ref<Record<string, any>[]>
) => {
  if (!column.dataIndex) return { defaultValue: text, displayValue: text };
  const defaultValue =
    unref(dataSource)[index][column.dataIndex as string] || text;
  let displayValue = defaultValue;
  switch (column.type) {
    case "select":
      if (column?.options?.options) {
        const currentOption = column.options.options.find(
          (option: { value: any }) => option.value === defaultValue
        );
        if (currentOption) displayValue = currentOption["label"];
      }
      break;
    case "date":
      displayValue = dayjs(defaultValue).format("YYYY-MM-DD");
      break;
    case "time":
      displayValue = dayjs(defaultValue).format("HH:mm:ss");
      break;
    case "datetime":
      displayValue = dayjs(defaultValue).format("YYYY-MM-DD HH:mm:ss");
      break;
    case "week":
      dayjs.extend(weekOfYear);
      displayValue = `${dayjs(defaultValue).format("YYYY")}-${dayjs(
        defaultValue
      ).week()}周`;
      break;
    case "month":
      displayValue = dayjs(defaultValue).format("YYYY-MM");
      break;
    case "quarter":
      //TODO:
      break;
    case "year":
      displayValue = dayjs(defaultValue).format("YYYY");
      break;
    case "range":
      //TODO:  picker="week","month","year" https://antdv.com/components/date-picker-cn
      displayValue = `${dayjs(defaultValue[0]).format("YYYY-MM-DD")} - ${dayjs(
        defaultValue[1]
      ).format("YYYY-MM-DD")}`;
      break;
    default:
      break;
  }
  return { defaultValue, displayValue };
};

export default useCellDisplayValue;
