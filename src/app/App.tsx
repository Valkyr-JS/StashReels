import React from "react";
import FeedPage from "../pages/Feed";
import { setCssVH } from "../helpers";

const App = () => {
  setCssVH();
  return <FeedPage />;
};

export default App;
