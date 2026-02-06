import React, { useMemo } from "react";
import { TagSelect as TagSelectSource, TagSelectProps } from "stash-ui/dist/src/components/Tags/TagSelect";
import "stash-ui/dist/src/components/Tags/styles.css";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";
export * from "stash-ui/dist/src/components/Tags/TagSelect";
import { Props as ReactSelectProps } from "react-select";

export function TagSelect(props: TagSelectProps & ReactSelectProps) {
  const history = useMemo(() => createBrowserHistory(), []);
  return (
    <Router history={history}>
      <TagSelectSource
        {...props}
      />
    </Router>
  );
}
