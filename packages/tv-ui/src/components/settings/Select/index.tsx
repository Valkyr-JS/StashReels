import React, { ReactElement, RefAttributes } from "react";
import RSSelect, { GroupBase } from "react-select";
import { useMedia } from "react-use";
import cx from "classnames";
import "./Select.css"
import { StateManagerProps } from "react-select/dist/declarations/src/useStateManager";
import type RSSelectInternal from "react-select/dist/declarations/src/Select";
import { useAppStateStore } from "../../../store/appStateStore";

// @ts-expect-error -- why-did-you-render doesn't type this properly but it does consume this
RSSelect.whyDidYouRender = {
  customName: 'ReactSelect'
}

type AdditionalProps = {
  expandWidthToFit?: boolean;
}

type Component = <Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(
  props: StateManagerProps<Option, IsMulti, Group> & RefAttributes<RSSelectInternal<Option, IsMulti, Group>> & AdditionalProps
) => ReactElement;

const Select: Component = (props) => {
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
      menu: (provided) => ({
        ...(expandWidthToFit ? {
          'maxWidth': 'calc(var(--x-unit-small) * 90)',
          'minWidth': 'max-content',
          ...(leftHandedUi ? { left: 0 } : {right: 0}),
        } : {}),
        ...(styles?.menu
          ? styles.menu(provided)
          : provided),
      }),
      menuList: (provided) => ({
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
      menu: (state) => state.placement === 'top' ? 'menu-above' : 'menu-below'
    }}
    menuPortalTarget={document.body}
    menuPosition="fixed"
    {...otherProps}
  />
}

export default Select;
