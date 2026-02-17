import React, { useMemo } from "react";
import { SceneMarkerForm as OriginalSceneMarkerForm} from "stash-ui/dist/src/components/Scenes/SceneDetails/SceneMarkerForm";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import cx from "classnames";
import "./SceneMarkerForm.css";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";

type Props = Omit<React.ComponentProps<typeof OriginalSceneMarkerForm>, "marker"> & {
  marker?: GQL.TvSceneDataFragment["scene_markers"][number];
  className?: string;
};

export const SceneMarkerForm = function ({className, marker, ...originalSceneMarkerFormProps}: Props) {
  const history = useMemo(() => createBrowserHistory(), []);
  return (
    <Router history={history}>
      <div className={cx("SceneMarkerForm", className)}>
        <OriginalSceneMarkerForm
          // We have to cast this because even though our slimmed down marker has all the fields that
          // OriginalSceneMarkerForm uses (as far as I can tell) it's types includes unused marker fields that we don't
          // have
          marker={marker as React.ComponentProps<typeof OriginalSceneMarkerForm>["marker"]}
          {...originalSceneMarkerFormProps}
        />
      </div>
    </Router>
  );
}
