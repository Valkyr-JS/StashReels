import React, { ComponentProps } from "react";
import RSSelect from "react-select";
import { useMedia } from "react-use";
import cx from "classnames";
import "./Select.css"

const Select: RSSelect = (props) => {
  const {className, ...otherProps} = props as ComponentProps<typeof RSSelect>;
  const hasTouchScreen = useMedia("(pointer: coarse)");
  // Disabling isSearchable on mobile resolves the issue of keyboard popping up on mobile devices and messing up the layout, particularly for forceLandscape mode
  const isSearchable = props.isSearchable !== undefined ? props.isSearchable : !hasTouchScreen;

  // We use the "react-select" class name so that stash styles are applied and we use menuPortalTarget to render the
  // menu outside of it's parent container so the dropdown is not cut off by overflow hidden/scrolled parents.
  return <RSSelect
    className={cx("Select", "react-select", className)}
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
