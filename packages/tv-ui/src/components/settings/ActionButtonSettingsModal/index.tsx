import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ActionButtonConfig } from "../../slide/ActionButtons";
import { useAppStateStore } from "../../../store/appStateStore";
import { actionButtonsDetails, getActionButtonDetails } from "../../../helpers/getActionButtonDetails";
import Select from "../Select";
import { TagSelect, Tag } from "stash-ui/wrappers/components/TagSelect";
import "./ActionButtonSettingsModal.css";
import { queryFindTagsByIDForSelect } from "stash-ui/dist/src/core/StashService";

import { Form } from "react-bootstrap";
import { ModalHeaderProps } from "react-bootstrap/esm/ModalHeader";
import ActionButton from "../../slide/ActionButton";

type Props = {
  actionButtonConfig: ActionButtonConfig;
  onUpdate: (updatedConfig: ActionButtonConfig) => void;
  onClose: () => void;
  onSave: (config: ActionButtonConfig) => void;
}

export const ActionButtonSettingsModal = ({ actionButtonConfig, onUpdate, onClose, onSave }: Props) => {
  const operation = actionButtonConfig.id ? "edit" : "add";
  const { actionButtonsConfig } = useAppStateStore();
  const possibleTypes = Object.entries(actionButtonsDetails)
    .map(([type, details]) => ({
      value: type as ActionButtonConfig["type"],
      label: details.inactiveText
    }))
    // Exclude singleton button types that are already displayed
    .filter(
      type => !actionButtonsConfig.some(config => config.type === type.value)
        // We can have as many as we want of these types
        || type.value === "quick-tag"
    )
  const [tag, setTag] = useState<Tag>()
  const [firstTag, setFirstTag] = useState<Tag>()
  useEffect(() => {
    if (!firstTag && tag) {
      setFirstTag(tag)
    }
  }, [tag, firstTag])

  const details = getActionButtonDetails(actionButtonConfig, { tagName: firstTag?.name })

  useEffect(() => {
    if (!('tagId' in actionButtonConfig)) return;
    queryFindTagsByIDForSelect([actionButtonConfig.tagId])
      .then(result => setTag(result.data.findTags.tags[0]))
  }, ['tagId' in actionButtonConfig ? actionButtonConfig.tagId : null])

  const ModalHeader = Modal.Header as React.ForwardRefExoticComponent<ModalHeaderProps & React.RefAttributes<HTMLDivElement>>

  return (
    <Modal show onHide={() => onClose()} title="" className="ActionButtonSettingsModal">
      <ModalHeader>
        {operation === "edit" && (
          <ActionButton
            {...details}
            active={false}
            disabled={true}
            key={actionButtonConfig.id}
          />
        )}
        {operation === "add"
          ? "Add Action Button"
          : <span>Edit <em>{details.inactiveText}</em> Action Button</span>
        }
      </ModalHeader>
      <Modal.Body>
        <div className="dialog-content">
          {operation === "add" && (
            <Form.Group>
              <label htmlFor="action-button-type">
                Action button type
              </label>
              <Select
                inputId="action-button-type"
                value={possibleTypes.find(type => type.value === actionButtonConfig.type)}
                onChange={(newValue) => {
                  if (!newValue) return;
                  const {pinned, id} = actionButtonConfig
                  let updatedConfig
                  if (newValue?.value === "quick-tag") {
                    updatedConfig = {
                      id,
                      type: newValue.value,
                      pinned,
                      tagId: "",
                      iconId: "",
                    }
                  } else {
                    updatedConfig = {
                      id,
                      type: newValue.value,
                      pinned
                    }
                  }
                  onUpdate(updatedConfig)
                }}
                options={possibleTypes}
              />
            </Form.Group>
          )}
          {actionButtonConfig.type === "quick-tag" && (
            <Form.Group>
              <label htmlFor="tag-id">
                Tag to add
              </label>
              <TagSelect
                inputId="tag-id"
                onSelect={(t) => {
                  setTag(t[0])
                  onUpdate({ ...actionButtonConfig, tagId: t[0].id })
                }}
                values={tag ? [tag] : []}
                hoverPlacement="right"
              />
            </Form.Group>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button variant="success" onClick={() => onSave(actionButtonConfig)}>
          {operation === "add" ? "Add" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
