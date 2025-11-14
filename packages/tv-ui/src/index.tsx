import "./helpers/renderDebugger";
import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import "stash-ui/dist/src/index.css";
import "stash-ui/dist/theme-variables.css";
import "./styles/globals.scss";

import { ApolloProvider } from "@apollo/client";
import { getApolloClient } from "./hooks/getApolloClient";


const container = document.getElementById("app");
ReactDOM.render(
    <ApolloProvider client={getApolloClient()}>
        <App />
    </ApolloProvider>,
    container
);
