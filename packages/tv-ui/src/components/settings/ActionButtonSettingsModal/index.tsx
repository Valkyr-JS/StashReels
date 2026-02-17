import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ActionButtonConfig } from "../../slide/ActionButtons";
import { ActionButtonIcons, actionButtonIcons, getActionButtonDetails } from "../../../helpers/getActionButtonDetails";
import Select from "../Select";
import { components, MenuListProps, OptionProps, SingleValueProps } from "react-select";
import { TagSelect, Tag } from "stash-ui/wrappers/components/TagSelect";
import { TagIdSelect } from "stash-ui/wrappers/components/TagIdSelect";
import "./ActionButtonSettingsModal.css";
import { queryFindTagsByIDForSelect } from "stash-ui/dist/src/core/StashService";
import { MarkerTitleSuggest } from "stash-ui/dist/src/components/Shared/Select";
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

  const customQuickTagIcons = Object.entries(actionButtonIcons)
    .filter(([key, icon]) => icon.category.includes("tag") || icon.category.includes("general"))
    .map(([key, icon]) => ({
      value: key as ActionButtonIcons,
      label: icon
    }))
  const customQuickCreateMarkerIcons = Object.entries(actionButtonIcons)
    .filter(([key, icon]) => icon.category.includes("marker") || icon.category.includes("general"))
    .map(([key, icon]) => ({
      value: key as ActionButtonIcons,
      label: icon
    }))

  // Custom MenuList component that displays options in a grid
  const GridMenuList = (props: MenuListProps<typeof customQuickTagIcons[number] | typeof customQuickCreateMarkerIcons[number]>) => {
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
  const GridOption = (props: OptionProps<typeof customQuickTagIcons[number] | typeof customQuickCreateMarkerIcons[number]>) => {
    return (
      <components.Option {...props}>
        <props.data.label.inactive size="100%" />
      </components.Option>
    );
  };

  // Custom SingleValue component to show selected icon
  const GridSingleValue = (props: SingleValueProps<typeof customQuickTagIcons[number] | typeof customQuickCreateMarkerIcons[number]>) => {
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
              <label htmlFor="button-icon">
                Action Button Icon
              </label>
              <Select<typeof customQuickTagIcons[number]>
                inputId="button-icon"
                value={customQuickTagIcons.find(icon => icon.value === actionButtonConfig.iconId)}
                options={customQuickTagIcons}
                onChange={(newValue: typeof customQuickTagIcons[number] | null) => onUpdate({ ...actionButtonConfig, iconId: (newValue && 'value' in newValue) ? newValue.value : "tag" })}
                components={{ MenuList: GridMenuList, Option: GridOption, SingleValue: GridSingleValue }}
              />
            </Form.Group>
          )}
          {actionButtonConfig.type === "edit-tags" && (
            <Form.Group>
              <label htmlFor="pinned-tags">
                Pinned Tags (optional)
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
          {actionButtonConfig.type === "quick-create-marker" && (
            <Form.Group>
              <label htmlFor="title">
                Title
              </label>
              <MarkerTitleSuggest
                initialMarkerTitle={actionButtonConfig.title}
                onChange={(v) => onUpdate({ ...actionButtonConfig, title: v })}
              />
            </Form.Group>
          )}
          {actionButtonConfig.type === "quick-create-marker" && (
            <Form.Group>
              <label htmlFor="primary-tag">
                Primary Tag (required)
              </label>
              <TagIdSelect
                inputId="primary-tag"
                ids={actionButtonConfig.primaryTagId ? [actionButtonConfig.primaryTagId] : []}
                onSelect={(tags: Tag[]) => onUpdate({ ...actionButtonConfig, primaryTagId: tags[0]?.id })}
                isClearable={false}
                hoverPlacement="right"
              />
            </Form.Group>
          )}
          {actionButtonConfig.type === "quick-create-marker" && (
            <Form.Group>
              <label htmlFor="tags">
                Tags (optional)
              </label>
              <TagIdSelect
                isMulti
                inputId="tags"
                ids={actionButtonConfig.tagIds || []}
                onSelect={(tags: Tag[]) => onUpdate({ ...actionButtonConfig, tagIds: tags.map(t => t.id) })}
                hoverPlacement="right"
              />
            </Form.Group>
          )}
          {actionButtonConfig.type === "quick-create-marker" && (
            <Form.Group>
              <label htmlFor="button-icon">
                Action Button Icon
              </label>
              <Select<typeof customQuickCreateMarkerIcons[number]>
                inputId="button-icon"
                value={customQuickCreateMarkerIcons.find(icon => icon.value === actionButtonConfig.iconId)}
                options={customQuickCreateMarkerIcons}
                onChange={(newValue: typeof customQuickCreateMarkerIcons[number] | null) => onUpdate({ ...actionButtonConfig, iconId: (newValue && 'value' in newValue) ? newValue.value : "tag" })}
                components={{ MenuList: GridMenuList, Option: GridOption, SingleValue: GridSingleValue }}
              />
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
