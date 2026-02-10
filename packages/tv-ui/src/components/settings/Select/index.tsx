import React from "react";
import RSSelect, { GroupBase, Props as StateManagerProps, SelectInstance, CSSObjectWithLabel, ClassNamesState } from "react-select";
import { useMedia } from "react-use";
import cx from "classnames";
import "./Select.css"
import { useAppStateStore } from "../../../store/appStateStore";

// @ts-expect-error -- why-did-you-render doesn't type this properly but it does consume this
RSSelect.whyDidYouRender = {
  customName: 'ReactSelect'
}

type AdditionalProps = {
  expandWidthToFit?: boolean;
}

// Define Select as a generic function component with explicit type parameters
function Select<Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(
  props: StateManagerProps<Option, IsMulti, Group> & AdditionalProps
): React.ReactElement {
  const {className, expandWidthToFit, styles, ...otherProps} = props
  const hasTouchScreen = useMedia("(pointer: coarse)");
  // Disabling isSearchable on mobile resolves the issue of keyboard popping up on mobile devices and messing up the layout, particularly for forceLandscape mode
  const isSearchable = props.isSearchable !== undefined ? props.isSearchable : !hasTouchScreen;

  const { leftHandedUi } = useAppStateStore();

  // We use the "react-select" class name so that stash styles are applied and we use menuPortalTarget to render the
  // menu outside of it's parent container so the dropdown is not cut off by overflow hidden/scrolled parents.
  return <RSSelect
    className={cx("Select", "react-select", className)}
    styles={{
      ...styles,
      menu: (provided: CSSObjectWithLabel) => ({
        ...(expandWidthToFit ? {
          'maxWidth': 'calc(var(--x-unit-small) * 90)',
          'minWidth': 'max-content',
          ...(leftHandedUi ? { left: 0 } : {right: 0}),
        } : {}),
        ...(styles?.menu
          ? styles.menu(provided)
          : provided),
      }),
      menuList: (provided: CSSObjectWithLabel) => ({
        ...(expandWidthToFit ? {
          scrollbarGutter: 'stable',
        } : {}),
        ...(styles?.menuList
          ? styles.menuList(provided)
          : provided),
      }),
    }}
    classNamePrefix="react-select"
    isSearchable={isSearchable}
    classNames={{
      menu: (state: ClassNamesState) => (state as any).placement === 'top' ? 'menu-above' : 'menu-below'
    }}
    menuPortalTarget={document.body}
    menuPosition="fixed"
    {...otherProps}
  />
}

// Export with proper generic signature for TypeScript
export default Select as <Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(
  props: StateManagerProps<Option, IsMulti, Group> & AdditionalProps
) => React.ReactElement;
