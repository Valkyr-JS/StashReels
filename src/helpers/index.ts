import { useWindowSize } from "../hooks";

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

/** Function for setting the --vsr-vh CSS variable used in video items. */
export const setCssVH = () => {
  const windowSize = useWindowSize();
  let vh = windowSize.height * 0.01;
  document.documentElement.style.setProperty("--vsr-vh", `${vh}px`);
};
