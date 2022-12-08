## INSTALL

```
npm install --save @cimc/raffles-crud
```

## USAGE

```
import { CCrud, CTable, CForm } from "@cimc/raffles-crud";
```

## PLUGIN

```
provide(pluginKey, {
  customType: {
    [key: string]: {
      new (column: CustomTableColumnProps): CustomRenderClass;
    };
  };
});
```
