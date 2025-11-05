import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import "./SceneInfo.css"
import React, { forwardRef } from "react";
import escapeStringRegexp from "escape-string-regexp";
import { proxyPrefix } from "../../../constants";
import { sortPerformers } from "../../../helpers";
import cx from "classnames";

export type Props = {
  style?: React.CSSProperties;
  scene: GQL.TvSceneDataFragment;
  className?: string;
}

const SceneInfo = forwardRef(({scene, className, style}: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    /* ---------------------------------- Date ---------------------------------- */

    const date = scene.date ? (
      <span className="date">{scene.date}</span>
    ) : null;

    /* ------------------------------- Performers ------------------------------- */

    const sortedPerformers = sortPerformers(scene.performers);
    const totalPerformers = sortedPerformers.length;

    const performersInner = sortedPerformers.map((pf, i) => {
      const isOneBeforeLast = i === totalPerformers - 2;
      const isAnyBeforeLast = i < totalPerformers - 1;
      let suffix = null;
      if (totalPerformers === 2 && isOneBeforeLast) suffix = " and ";
      else {
        if (isAnyBeforeLast) suffix = ", ";
        if (isOneBeforeLast) suffix += "and ";
      }
      return (
        <React.Fragment key={i}>
          <span>{pf.name}</span>
          {suffix}
        </React.Fragment>
      );
    });

    const performers = performersInner.length ? (
      <div className="performers">{performersInner}</div>
    ) : null;

    /* --------------------------------- Studio --------------------------------- */

    const parentStudioText = scene.studio?.parent_studio
      ? " | " + scene.studio.parent_studio.name
      : "";

    const studio = scene.studio ? (
      <span className="studio">
        {scene.studio.name + parentStudioText}
      </span>
    ) : null;

    /* ---------------------------------- Title --------------------------------- */

    const title = scene.title ? <h5>{scene.title}</h5> : null;
    let sceneUrl = scene.paths.stream?.split("/stream")[0]?.replace("/scene", "/scenes")
    if (sceneUrl && import.meta.env.STASH_ADDRESS) {
      const scenePath = new URL(sceneUrl).pathname.replace(new RegExp(`^${escapeStringRegexp(proxyPrefix)}`), "");
      sceneUrl = new URL(scenePath, import.meta.env.STASH_ADDRESS).toString()
    }

    /* -------------------------------- Component ------------------------------- */

    return (
      <div
        className={cx("SceneInfo", className)}
        data-testid="MediaSlide--sceneInfo"
        style={style}
        ref={ref}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {studio}
        <a href={sceneUrl || ""} target="_blank">{title}</a>
        {performers}
        {date}
      </div>
    );
  }
);

export default SceneInfo
