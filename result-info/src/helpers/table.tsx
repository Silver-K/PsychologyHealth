import type { Column } from "element-plus";
import type { MinorInfoT } from "~/types/minors";

export function generateCols<T extends string[]>(config: {
  keys: T,
  renderer: (key: string) => (Column<MinorInfoT>['CellRenderer']),
  width: number | ((key: string, index: number) => number),
  titleObj: Record<string, string> 
}, pre?: Column, append?: Column) {
  const { keys, renderer, width, titleObj } = config;
  const preA: Column[] = pre ? [pre].flat() : [];
  const appendA: Column[] = append ? [append].flat() : [];
  return preA.concat(keys.map((key, index) => ({
    key: `col-${index + 1}`,
    dataKey: key,
    title: titleObj[key],
    width: typeof width === 'function' ? width(key, index) : width,
    cellRenderer: renderer(key)
  }))).concat(appendA);
}