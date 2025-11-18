import React, { memo } from "react"
import "./ClipTimestamp.css"

type Props = {
  type: 'start' | 'end',
  progressPercentage: number,
}

const ClipTimestamp = memo(({type, progressPercentage}: Props) => {
  return (
    <div
      className={`ClipTimestamp vjs-control ${type}-timestamp`}
      style={{left: `${progressPercentage}%`}}
    ></div>
  )
})

export default ClipTimestamp
