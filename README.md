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
  customCell: {
    date: {
      displayRender: ({ text }) => `date-${text}`,
      editorRender: ({ text }) => `date-${text}`,
    },
  },
});
```
