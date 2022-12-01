import {
  usePagination as useDefaultPagination,
  useRequest as useDefaultRequest,
  clearCache,
  setGlobalOptions,
  useLoadMore,
  useRequestProvider,
  Service,
  PaginationOptions,
} from "vue-request";

import { ref, computed } from "vue";
import type { AxiosResponse } from "axios";

import type { TablePaginationConfig } from "ant-design-vue";
import { Options } from "vue-request";

interface CustomPaginationOptions<R, P extends unknown[]>
  extends PaginationOptions<R, P> {
  params?: Record<string, any>;
}

interface CustomPaginationParameter {
  page: number;
  size: number;
  sort: string | CustomSorterParameter;
  [key: string]: any;
}

interface CustomSorterParameter {
  field: string;
  order?: string;
}

const defaultPageSize = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE || 10);

// @see https://next.attojs.com/guide/documentation/pagination.html
// add parameter: options.params
// add result: dataSource, pagination, onPaginationChange
function usePagination<R, P extends unknown[] = any>(
  service: Service<R, P>,
  options: CustomPaginationOptions<R, P> = {}
) {
  if (!options.pagination)
    options.pagination = {
      currentKey: "page",
      pageSizeKey: "size",
      totalKey: "data.totalElements",
      totalPageKey: "data.totalPages",
    };

  //   if (!options.manual && !options.defaultParams?.length && options.params)
  //     options.defaultParams = [{ size: defaultPageSize, ...options.params }];

  const onBefore = options.onBefore;
  options.onBefore = (params: P) => {
    if (params.length && params[0]) {
      const customParameter = params[0] as CustomPaginationParameter;
      const { page, size, sort } = customParameter;
      customParameter.page = page ? page - 1 : 0;
      customParameter.size = size || defaultPageSize;
      if (sort && sort instanceof Object && sort.field)
        customParameter.sort = [
          sort.field,
          sort.order ? sort.order.replace("end", "") : undefined,
        ].join(",");
    }
    if (options.params)
      params[0] = Object.assign(params[0] || {}, options.params);
    if (onBefore) onBefore(params);
  };

  const result = useDefaultPagination(service, options);

  const dataSource = computed(() => {
    const response = (result.data.value as AxiosResponse)?.data;
    if (!response) return [];
    if (response instanceof Array) return response;
    if (response?.content instanceof Array) return response.content;
    return response || [];
  });

  const pagination = computed(() => ({
    defaultPageSize,
    total: result.total.value || 0,
    current: (result.current.value || 0) + 1,
    pageSize: result.pageSize.value,
    showTotal: (total: number, range: number[]) =>
      `${range[0]}-${range[1]} of ${total} items`,
  }));

  const onPaginationChange = (
    page: TablePaginationConfig = {},
    filters: Record<string, any>,
    sorter: CustomSorterParameter
  ) => {
    // TODO:
    // @ts-ignore
    result.run({
      page: page.current,
      size: page.pageSize || page.defaultPageSize,
      sort: sorter,
      ...filters,
      ...(options.params || {}),
    });
  };

  return Object.assign(result, { dataSource, pagination, onPaginationChange });
}

function useRequest<R, P extends unknown[] = any>(
  service: Service<R, P>,
  options: Options<R, P>
) {
  const result = useDefaultRequest(service, options);
  return Object.assign(result, {
    dataSource: (result.data.value as AxiosResponse)?.data,
  });
}

export {
  usePagination,
  useRequest,
  clearCache,
  setGlobalOptions,
  useLoadMore,
  useRequestProvider,
};
