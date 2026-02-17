import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ActionButtonConfig } from "../../slide/ActionButtons";
import { ActionButtonCustomIcons, actionButtonCustomIcons, getActionButtonDetails } from "../../../helpers/getActionButtonDetails";
import Select from "../Select";
import { components, MenuListProps, OptionProps, SingleValueProps } from "react-select";
import { TagSelect, Tag } from "stash-ui/wrappers/components/TagSelect";
import { TagIdSelect } from "stash-ui/wrappers/components/TagIdSelect";
import "./ActionButtonSettingsModal.css";
import { queryFindTagsByIDForSelect } from "stash-ui/dist/src/core/StashService";
import { Form } from "react-bootstrap";
import { ModalHeaderProps } from "react-bootstrap/esm/ModalHeader";
import ActionButton from "../../slide/ActionButton";
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["stash-tv", "ActionButtonSettingsModal"]);


type Props = {
  actionButtonConfig: ActionButtonConfig;
  onUpdate: (updatedConfig: ActionButtonConfig) => void;
  onClose: () => void;
  onSave: (config: ActionButtonConfig) => void;
}

export const ActionButtonSettingsModal = ({ actionButtonConfig, onUpdate, onClose, onSave }: Props) => {
  const operation = actionButtonConfig.id ? "edit" : "add";
  const [tag, setTag] = useState<Tag>()

  const initialConfig = useMemo(() => ({...actionButtonConfig}), [])
  const [initialTagName, setInitialTagName] = useState<string>()
  useEffect(() => {
    if (!initialTagName && 'tagId' in initialConfig && tag && initialConfig.tagId === tag?.id) {
      setInitialTagName(tag.name)
    }
  }, [initialTagName, initialConfig, tag])

  // We memorise this so that the header shows the state of the saved config, not the config as it's being edited
  const initialDetails = useMemo(
    () => getActionButtonDetails(actionButtonConfig, { tagName: initialTagName }),
    [initialConfig.id, initialTagName]
  )

  useEffect(() => {
    if (!('tagId' in actionButtonConfig) || !actionButtonConfig.tagId) return;
    queryFindTagsByIDForSelect(actionButtonConfig.tagId ? [actionButtonConfig.tagId] : [])
      .then(result => setTag(result.data.findTags.tags[0]))
  }, ['tagId' in actionButtonConfig ? actionButtonConfig.tagId : null])

  const ModalHeader = Modal.Header as React.ForwardRefExoticComponent<ModalHeaderProps & React.RefAttributes<HTMLDivElement>>

  const customIcons = Object.entries(actionButtonCustomIcons).map(([key, icon]) => ({
    value: key as ActionButtonCustomIcons,
    label: icon
  }))

  // Custom MenuList component that displays options in a grid
  const GridMenuList = (props: MenuListProps<typeof customIcons[number]>) => {
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

  // Custom Option component for grid items
  const GridOption = (props: OptionProps<typeof customIcons[number]>) => {
    return (
      <components.Option {...props}>
        <props.data.label.inactive size="100%" />
      </components.Option>
    );
  };

  // Custom SingleValue component to show selected icon
  const GridSingleValue = (props: SingleValueProps<typeof customIcons[number]>) => {
    return (
      <components.SingleValue {...props}>
        <div style={{ display: 'flex', alignItems: 'center', margin: '0.5em 0' }}>
          <props.data.label.inactive size={40} />
        </div>
      </components.SingleValue>
    );
  };

  return (
    <Modal show onHide={() => onClose()} title="" className="ActionButtonSettingsModal">
      <ModalHeader>
        <ActionButton
          {...initialDetails.props}
          active={false}
          key={actionButtonConfig.id}
          size="auto"
          displayOnly={true}
        />
        <span>
          {operation === "add" ? "Add" : "Edit"}{" "}
          <em>{initialDetails.inactiveText}</em>{" "}
          Action Button
        </span>
      </ModalHeader>
      <Modal.Body>
        <div className="dialog-content">
          {actionButtonConfig.type === "quick-tag" && (
            <Form.Group>
              <label htmlFor="tag-id">
                Tag to add (required)
              </label>
              <TagSelect
                inputId="tag-id"
                onSelect={(tags: Array<{ id: string; name: string }>) => {
                  const tag = tags[0] as Tag
                  setTag(tag)
                  onUpdate({ ...actionButtonConfig, tagId: tag?.id })
                }}
                values={tag ? [tag] : []}
                hoverPlacement="right"
              />
            </Form.Group>
          )}
          {actionButtonConfig.type === "quick-tag" && (
            <Form.Group>
              <label htmlFor="filter">
                Action Button Icon
              </label>
              <Select<typeof customIcons[number]>
                inputId="filter"
                value={customIcons.find(icon => icon.value === actionButtonConfig.iconId)}
                options={customIcons}
                onChange={(newValue: typeof customIcons[number] | null) => onUpdate({ ...actionButtonConfig, iconId: (newValue && 'value' in newValue) ? newValue.value : "tag" })}
                components={{ MenuList: GridMenuList, Option: GridOption, SingleValue: GridSingleValue }}
              />
            </Form.Group>
          )}
          {actionButtonConfig.type === "edit-tags" && (
            <Form.Group>
              <label htmlFor="pinned-tags">
                Pinned Tags
              </label>
              <TagIdSelect
                isMulti
                inputId="pinned-tags"
                ids={actionButtonConfig.pinnedTagIds || []}
                onSelect={(tags: Tag[]) => onUpdate({ ...actionButtonConfig, pinnedTagIds: tags.map(t => t.id) })}
                hoverPlacement="right"
              />
              <Form.Text className="text-muted">
                Pinned tags allow you to quickly add your most used tags.
              </Form.Text>
            </Form.Group>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(actionButtonConfig)}>
          {operation === "add" ? "Add" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
