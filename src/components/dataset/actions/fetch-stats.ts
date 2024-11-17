import { IndexItem } from "@/types";

export const countTotalItems = (data: IndexItem[]) => {
  let count = 0;

  const countRecursive = (item: IndexItem) => {
    count++;
    item.children?.forEach(countRecursive);
  };

  data.forEach(countRecursive);
  return count;
}
