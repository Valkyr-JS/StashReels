import React from "react";
import Select from "../Select";
import { components, MenuListProps, OptionProps, SingleValueProps } from "react-select";


export const IconSelect: typeof Select = (props) => {
  const GridMenuList = (props: MenuListProps<unknown>) => {
    return (
      <components.MenuList {...props}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
          gap: '8px',
          padding: '8px'
        }}>
          {props.children}
        </div>
      </components.MenuList>
    );
  };

  const GridOption = (props: OptionProps<{label: React.ComponentType<{size: string | number}>}>) => {
    return (
      <components.Option {...props}>
        <props.data.label size="100%" />
      </components.Option>
    );
  };

  const GridSingleValue = (props: SingleValueProps<{label: React.ComponentType<{size: string | number}>}>) => {
    return (
      <components.SingleValue {...props}>
        <div style={{ display: 'flex', alignItems: 'center', margin: '0.5em 0' }}>
          <props.data.label size={40} />
        </div>
      </components.SingleValue>
    );
  };

  return (
    <Select
      {...props}
      inputId="button-icon"
      components={{
        MenuList: GridMenuList,
        Option: GridOption,
        SingleValue: GridSingleValue,
        ...props.components
      }}
    />
  )
}
