import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import "./styles/globals.scss";

import { ApolloProvider } from "@apollo/client";
import { getClient } from "../vendor/stash/ui/v2.5/build/src/core/StashService";

const container = document.getElementById("app");
ReactDOM.render(
    <ApolloProvider client={getClient()}>
        <App />
    </ApolloProvider>,
    container
);
