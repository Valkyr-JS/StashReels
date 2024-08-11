import React from "react";
import FeedPage from "../pages/Feed";
import { setCssVH } from "../helpers";

const App = () => {
  setCssVH();
  return <FeedPage query={query} captionsDefault={undefined} />;
};

export default App;

const query = `{
      findScenes(
        filter: {per_page: -1, sort: "random"}
        scene_filter: {orientation: {value: PORTRAIT}}
      ) {
        scenes {
          captions {
            caption_type
            language_code
          }
          date
          id
          files {
            format
          }
          paths {
            caption
            stream
          }
          performers {
            gender
            name
          }
          studio {
            name
            parent_studio {
              name
            }
          }
          title
        }
      }
    }`;
