import { useEffect } from "react";

/** Fetch data from Stash via GQL. */
export const fetchData = async (query: string) => {
  try {
    const res = await fetch(
      process.env.NODE_ENV === "production"
        ? "/graphql"
        : process.env.STASH_ADDRESS + "/graphql",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }
    );
    return await res.json();
  } catch (err) {
    return console.log(err);
  }
};

