import React, { ReactNode } from "react";
import { Reorder } from "framer-motion";
import "./DraggableList.css"

interface Props<Item> {
  items: Item[],
  onItemsOrderChange: (newOrder: Item[]) => void,
  renderItem: (item: Item) => ReactNode,
  getItemKey: (item: Item) => string,
}

function DraggableList<Item>({ items, onItemsOrderChange, renderItem, getItemKey }: Props<Item>) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onItemsOrderChange}
      className="DraggableList"
    >
      {items.map((item, index) => (
        <Reorder.Item key={getItemKey(item)} value={item} className="draggableItem">
          {renderItem(item)}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}

export default DraggableList;
