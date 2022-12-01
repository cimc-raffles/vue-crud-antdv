import CCrud from "./CCrud.vue";
import CForm from "./CForm.vue";
import CField from "./CField.vue";
import CTable from "./CTable.vue";
import CToolbar from "./CToolbar.vue";
import CColumnSelect from "./CColumnSelect.vue";

import { pluginKey } from "../utils/key";
import {
  usePagination,
  useRequest,
  clearCache,
  setGlobalOptions,
  useLoadMore,
  useRequestProvider,
} from "../utils/request";

export {
  CForm,
  CField,
  CTable,
  CCrud,
  CToolbar,
  CColumnSelect,
  usePagination,
  useRequest,
  clearCache,
  setGlobalOptions,
  useLoadMore,
  useRequestProvider,
  pluginKey,
};
