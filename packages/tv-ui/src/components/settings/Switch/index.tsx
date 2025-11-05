import React from "react"
import { Form } from "react-bootstrap"
import cx from "classnames"
import "./Switch.css"

const Switch = function Switch(props) {
  return <Form.Switch
    {...props}
    className={cx("Switch", props.className)}
    label={<span>{props.label}</span>}
  />
} as typeof Form["Switch"]

export default Switch
