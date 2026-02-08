import React, { ReactNode, useCallback, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import "./DraggableList.css"
import cx, {Argument as ClassNameArgs} from "classnames";

type GetDragHandleProps = (props?: {className?: ClassNameArgs}) => { onPointerDown: (e: React.PointerEvent) => void }
const draggableClassName = "draggable";

function DraggableListItem<Item>({
  item,
  renderItem,
}: {
  item: Item,
  renderItem: (item: Item, getDragHandleProps: GetDragHandleProps) => ReactNode,
}) {
  const controls = useDragControls();

  const [dragHandleInUse, setDragHandleInUse] = useState(false);
  const getDragHandleProps = useCallback(
    (props?: {className?: ClassNameArgs}) => {
      if (!dragHandleInUse) setDragHandleInUse(true);
      return {
        className: cx(draggableClassName, props?.className),
        onPointerDown: (e: React.PointerEvent) => controls.start(e)
      }
    },
    [controls, dragHandleInUse, setDragHandleInUse]
  );

  return (
    <Reorder.Item
      value={item}
      className={cx({[draggableClassName]: !dragHandleInUse})}
      dragListener={!dragHandleInUse}
      dragControls={controls}
    >
      {renderItem(item, getDragHandleProps)}
    </Reorder.Item>
  );
}

function DraggableList<Item>(
  {
    className,
    items,
    onItemsOrderChange,
    renderItem,
    getItemKey,
  }: {
    className?: ClassNameArgs,
    items: Item[],
    onItemsOrderChange: (newOrder: Item[]) => void,
    renderItem: (item: Item, getDragHandleProps: GetDragHandleProps) => ReactNode,
    getItemKey: (item: Item) => string,
  }
) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onItemsOrderChange}
      className={cx("DraggableList", className)}
    >
      {items.map((item, index) => (
        <DraggableListItem<Item>
          key={getItemKey(item)}
          item={item}
          renderItem={renderItem}
        />
      ))}
    </Reorder.Group>
  )
}

export default DraggableList;
