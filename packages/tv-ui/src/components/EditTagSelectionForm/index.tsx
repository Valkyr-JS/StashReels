import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import objectHash from "object-hash";
import { queryFindTagsByIDForSelect } from "stash-ui/dist/src/core/StashService";
import { Tag } from "stash-ui/dist/src/components/Tags/TagSelect";
import { getLogger } from "@logtape/logtape";
import cx from "classnames";
import "./EditTagSelectionForm.css";
import { TagSelect } from "stash-ui/wrappers/components/TagSelect";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const logger = getLogger(["stash-tv", "EditTagSelectionForm"]);

export type SlimTag = Omit<Tag, "aliases"> & Partial<Pick<Tag, "aliases">>

export function EditTagSelectionForm(
  {initialTags, pinnedTagIds, save, cancel}: {
    initialTags: SlimTag[],
    pinnedTagIds?: string[],
    save: (tags: SlimTag[]) => void,
    cancel: () => void
  }) {
  const [selectedTags, setSelectedTags] = useState<SlimTag[]>(
    initialTags
  );
  const [pinnedTags, setPinnedTags] = useState<Tag[]>([]);
  const nonSelectedPinnedTags = useMemo(
    () => pinnedTags.filter(tag => !selectedTags.some(t => t.id === tag.id)),
    [pinnedTags, selectedTags]
  )

  useEffect(() => {
    if (!pinnedTagIds || !pinnedTagIds.length) return;
    queryFindTagsByIDForSelect(pinnedTagIds)
      .then(result => setPinnedTags(result.data.findTags.tags))
      .catch((error) => {
        logger.error(`Error when fetching tags ${pinnedTagIds.join(", ")} for edit tags form: {error}`, {error})
      })
  }, [objectHash(pinnedTagIds?.toSorted() || [])])

  const tagsChanged = useMemo(
    () => initialTags.length !== selectedTags.length
      || initialTags.some(
        savedTag => !selectedTags.some(draftTag => draftTag.id === savedTag.id)
      ),
    [initialTags, selectedTags]
  )
  return <div className="EditTagSelectionForm">
    <div className="main">
      <TagSelect
        isMulti
        values={selectedTags}
        onSelect={(tags: Tag[]) => setSelectedTags(tags)}
        hoverPlacement="top"
        excludeIds={pinnedTagIds}
      />
      <div className="actions">
        <Button
          variant="primary"
          onClick={() => {save(selectedTags); cancel()}}
          data-testid="MediaSlide--editTagsSaveButton"
          disabled={!tagsChanged}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={cancel}
        >
          Cancel
        </Button>
      </div>
    </div>
    <div className="pinned">
      {nonSelectedPinnedTags.map(tag => (
        <Button
          variant="link"
          key={tag.id}
          onClick={() => {setSelectedTags(selectedTags => ([...selectedTags, tag]))}}
        >
          <Badge
            className={cx("tag-item")}
            variant="secondary"
          >
            {tag.name}
            <FontAwesomeIcon className="add-icon" icon={faPlus} />
          </Badge>
        </Button>
      ))}
    </div>
  </div>
}
