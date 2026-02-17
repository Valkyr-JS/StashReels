import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ActionButtonConfig, editTagsActionButtonSchema, quickCreateMarkerActionButtonSchema, quickTagActionButtonSchema } from "../../slide/ActionButtons";
import { ActionButtonIcons, actionButtonIcons, getActionButtonDetails } from "../../../helpers/getActionButtonDetails";
import { Tag } from "stash-ui/wrappers/components/TagSelect";
import { TagIdSelect } from "stash-ui/wrappers/components/TagIdSelect";
import "./ActionButtonSettingsModal.css";
import { queryFindTagsByIDForSelect } from "stash-ui/dist/src/core/StashService";
import { yupFormikValidate } from "stash-ui/dist/src/utils/yup";
import { MarkerTitleSuggest } from "stash-ui/dist/src/components/Shared/Select";
import { Form } from "react-bootstrap";
import { ModalHeaderProps } from "react-bootstrap/esm/ModalHeader";
import ActionButton from "../../slide/ActionButton";
import { getLogger } from "@logtape/logtape";
import { IconSelect } from "../IconSelect";
import { useFormik } from "formik";
import * as yup from "yup";

const logger = getLogger(["stash-tv", "ActionButtonSettingsModal"]);

type Props = {
  initialActionButtonConfig: ActionButtonConfig;
  onClose: () => void;
  onSave: (config: ActionButtonConfig) => void;
}

export const ActionButtonSettingsModal = ({ initialActionButtonConfig, onClose, onSave }: Props) => {
  const operation = initialActionButtonConfig.id ? "edit" : "add";
  const [tag, setTag] = useState<Tag>()

  const initialConfig = initialActionButtonConfig
  const [initialTagName, setInitialTagName] = useState<string>()
  useEffect(() => {
    if (!initialTagName && 'tagId' in initialConfig && tag && initialConfig.tagId === tag?.id) {
      setInitialTagName(tag.name)
    }
  }, [initialTagName, initialConfig, tag])

  // We memorise this so that the header shows the state of the saved config, not the config as it's being edited
  const initialDetails = useMemo(
    () => getActionButtonDetails(initialConfig, { tagName: initialTagName }),
    [initialConfig.id, initialTagName]
  )

  const ModalHeader = Modal.Header as React.ForwardRefExoticComponent<ModalHeaderProps & React.RefAttributes<HTMLDivElement>>

  let formik
  let form
  if (initialActionButtonConfig.type === "quick-tag") {
    formik = useFormik<yup.InferType<typeof quickTagActionButtonSchema>>({
      initialValues: initialActionButtonConfig,
      enableReinitialize: true,
      validate: yupFormikValidate(quickTagActionButtonSchema),
      onSubmit: (values) => onSave(quickTagActionButtonSchema.cast(values)),
    });
    form = <QuickTagForm formik={formik} />
  } else if (initialActionButtonConfig.type === "edit-tags") {
    formik = useFormik<yup.InferType<typeof editTagsActionButtonSchema>>({
      initialValues: initialActionButtonConfig,
      enableReinitialize: true,
      validate: yupFormikValidate(editTagsActionButtonSchema),
      onSubmit: (values) => onSave(editTagsActionButtonSchema.cast(values)),
    });
    form = <EditTagsForm formik={formik} />
  } else if (initialActionButtonConfig.type === "quick-create-marker") {
    formik = useFormik<yup.InferType<typeof quickCreateMarkerActionButtonSchema>>({
      initialValues: initialActionButtonConfig,
      enableReinitialize: true,
      validate: yupFormikValidate(quickCreateMarkerActionButtonSchema),
      onSubmit: (values) => onSave(quickCreateMarkerActionButtonSchema.cast(values)),
    });
    form = <QuickCreateMarkerForm formik={formik} />
  } else {
    throw new Error(`Unknown action button type: ${initialActionButtonConfig.type}`)
  }

  useEffect(() => {
    if (!('tagId' in formik.values) || !formik.values.tagId) return;
    queryFindTagsByIDForSelect(formik.values.tagId ? [formik.values.tagId] : [])
      .then(result => setTag(result.data.findTags.tags[0]))
  }, ['tagId' in formik.values ? formik.values.tagId : null])


  return (
    <Modal show onHide={() => onClose()} title="" className="ActionButtonSettingsModal">
      <ModalHeader>
        <ActionButton
          {...initialDetails.props}
          active={false}
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
          {form}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => formik.submitForm()}>
          {operation === "add" ? "Add" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function QuickTagForm({formik}: { formik: ReturnType<typeof useFormik<yup.InferType<typeof quickTagActionButtonSchema>>> }) {
  const customQuickTagIcons = Object.entries(actionButtonIcons)
    .filter(([key, icon]) => icon.category.includes("tag") || icon.category.includes("general"))
    .map(([key, icon]) => ({
      value: key as ActionButtonIcons,
      label: icon.inactive
    }))
  const { tagId: tagIdError, iconId: iconIdError, ...otherErrors } = formik.errors
  return <>
    <Form.Group>
      <label htmlFor="tag-id">
        Tag to add (required)
      </label>
      <TagIdSelect
        inputId="tag-id"
        onSelect={(tags: Array<{ id: string; name: string }>) => {
          const tag = tags[0] as Tag
          formik.setFieldValue("tagId", tag?.id)
        }}
        ids={formik.values.tagId ? [formik.values.tagId] : []}
        hoverPlacement="right"
      />
      {formik.touched.tagId && (
        <Form.Control.Feedback type="invalid">
          {tagIdError}
        </Form.Control.Feedback>
      )}
    </Form.Group>
    <Form.Group>
      <label htmlFor="button-icon">
        Action Button Icon
      </label>
      <IconSelect
        inputId="button-icon"
        value={customQuickTagIcons.find(icon => icon.value === formik.values.iconId)}
        options={customQuickTagIcons}
        onChange={
          (newValue: typeof customQuickTagIcons[number] | null) =>
            formik.setFieldValue("iconId", (newValue && 'value' in newValue) ? newValue.value : "add-tag")
        }
      />
      {formik.touched.iconId && (
        <Form.Control.Feedback type="invalid">
          {iconIdError}
        </Form.Control.Feedback>
      )}
    </Form.Group>
    {Object.keys(otherErrors).length > 0 && (
      <Form.Control.Feedback type="invalid">
        <ul>
          {Object.entries(otherErrors).map(([key, error]) => (
            <li key={key}>{error}</li>
          ))}
        </ul>
      </Form.Control.Feedback>
    )}
  </>
}


function EditTagsForm({formik}: { formik: ReturnType<typeof useFormik<yup.InferType<typeof editTagsActionButtonSchema>>> }) {
  const { pinnedTagIds: pinnedTagIdsError, ...otherErrors } = formik.errors
  return <>
    <Form.Group>
      <label htmlFor="pinned-tags">
        Pinned Tags (optional)
      </label>
      <TagIdSelect
        isMulti
        inputId="pinned-tags"
        ids={formik.values.pinnedTagIds || []}
        onSelect={(tags: Tag[]) => formik.setFieldValue("pinnedTagIds", tags.map(t => t.id))}
        hoverPlacement="right"
      />
      {formik.touched.pinnedTagIds && (
        <Form.Control.Feedback type="invalid">
          {pinnedTagIdsError}
        </Form.Control.Feedback>
      )}
      <Form.Text className="text-muted">
        Pinned tags allow you to quickly add your most used tags.
      </Form.Text>
    </Form.Group>
    {Object.keys(otherErrors).length > 0 && (
      <Form.Control.Feedback type="invalid">
        <ul>
          {Object.entries(otherErrors).map(([key, error]) => (
            <li key={key}>{error}</li>
          ))}
        </ul>
      </Form.Control.Feedback>
    )}
  </>
}

function QuickCreateMarkerForm({formik}: { formik: ReturnType<typeof useFormik<yup.InferType<typeof quickCreateMarkerActionButtonSchema>>> }) {
  const customQuickCreateMarkerIcons = Object.entries(actionButtonIcons)
    .filter(([key, icon]) => icon.category.includes("marker") || icon.category.includes("general"))
    .map(([key, icon]) => ({
      value: key as ActionButtonIcons,
      label: icon.inactive
    }))
  const { title: titleError, primaryTagId: primaryTagIdError, iconId: iconIdError, ...otherErrors } = formik.errors
  return <>
    <Form.Group>
      <label htmlFor="title">
        Title (optional)
      </label>
      <MarkerTitleSuggest
        initialMarkerTitle={formik.values.title}
        onChange={(v) => formik.setFieldValue("title", v)}
      />
      {formik.touched.title && (
        <Form.Control.Feedback type="invalid">
          {titleError}
        </Form.Control.Feedback>
      )}
    </Form.Group>
    <Form.Group>
      <label htmlFor="primary-tag">
        Primary Tag (required)
      </label>
      <TagIdSelect
        inputId="primary-tag"
        ids={formik.values.primaryTagId ? [formik.values.primaryTagId] : []}
        onSelect={(tags: Tag[]) => formik.setFieldValue("primaryTagId", tags[0]?.id)}
        isClearable={false}
        hoverPlacement="right"
      />
      {formik.touched.primaryTagId && (
        <Form.Control.Feedback type="invalid">
          {primaryTagIdError}
        </Form.Control.Feedback>
      )}
    </Form.Group>
    <Form.Group>
      <label htmlFor="tags">
        Tags (optional)
      </label>
      <TagIdSelect
        isMulti
        inputId="tags"
        ids={formik.values.tagIds || []}
        onSelect={(tags: Tag[]) => formik.setFieldValue("tagIds", tags.map(t => t.id))}
        hoverPlacement="right"
      />
    </Form.Group>
    <Form.Group>
      <label htmlFor="button-icon">
        Action Button Icon
      </label>
      <IconSelect
        inputId="button-icon"
        value={customQuickCreateMarkerIcons.find(icon => icon.value === formik.values.iconId)}
        options={customQuickCreateMarkerIcons}
        onChange={
          (newValue: typeof customQuickCreateMarkerIcons[number] | null) =>
            formik.setFieldValue("iconId", (newValue && 'value' in newValue) ? newValue.value : "add-marker")
        }
      />
      {formik.touched.iconId && (
        <Form.Control.Feedback type="invalid">
          {iconIdError}
        </Form.Control.Feedback>
      )}
    </Form.Group>
    {Object.keys(otherErrors).length > 0 && (
      <Form.Control.Feedback type="invalid">
        <ul>
          {Object.entries(otherErrors).map(([key, error]) => (
            <li key={key}>{error}</li>
          ))}
        </ul>
      </Form.Control.Feedback>
    )}
  </>
}
