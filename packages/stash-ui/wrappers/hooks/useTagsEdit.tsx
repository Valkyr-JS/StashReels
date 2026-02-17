import React, { useMemo } from "react";
import "stash-ui/dist/src/components/Tags/styles.css";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { useTagsEdit as originalUseTagsEdit } from "stash-ui/dist/src/hooks/tagsEdit";

export const useTagsEdit: typeof originalUseTagsEdit = (...args) => {
  const history = useMemo(() => createBrowserHistory(), []);
  const { tagsControl, ...other } = originalUseTagsEdit(...args);
  return {
    tagsControl: (...args) => (
      <Router history={history}>
        {tagsControl(...args)}
      </Router>
    ),
    ...other,
  }
}
