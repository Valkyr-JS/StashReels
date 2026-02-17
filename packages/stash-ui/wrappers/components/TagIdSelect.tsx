import React, { useMemo } from "react";
import { TagIDSelect as TagIdSelectSource } from "stash-ui/dist/src/components/Tags/TagSelect";
import "stash-ui/dist/src/components/Tags/styles.css";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";
export * from "stash-ui/dist/src/components/Tags/TagSelect";
import { Props as ReactSelectProps } from "react-select";

type Props = React.ComponentProps<typeof TagIdSelectSource> & ReactSelectProps;

export function TagIdSelect(props: Props) {
  const history = useMemo(() => createBrowserHistory(), []);
  return (
    <Router history={history}>
      <TagIdSelectSource
        {...props}
      />
    </Router>
  );
}
