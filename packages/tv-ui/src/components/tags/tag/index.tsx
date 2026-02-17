import React from "react"
import { Badge, Button } from "react-bootstrap"
import { SlimTag } from "../../EditTagSelectionForm"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import cx from "classnames"
import "./Tag.css"

export function Tag({tag, onClick, icon, className}: {tag: SlimTag, icon?: "add", className?: string} & React.HTMLAttributes<HTMLDivElement>) {
  const renderBadge = ({className}: {className?: string} = {}) => (
    <Badge
      className={cx("tag-item", className)}
      variant="secondary"
    >
      {tag.name}
      {icon === "add" && <FontAwesomeIcon className="add-icon" icon={faPlus} />}
    </Badge>
  )
  const rootClassName = cx("Tag", className)
  if (onClick) {
    return (
      <Button
        className={rootClassName}
        variant="link"
        onClick={onClick}
      >
        {renderBadge()}
      </Button>
    )
  }
  return renderBadge({className: rootClassName})
}
