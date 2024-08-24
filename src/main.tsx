import React from "react";
import { faMobile } from "@fortawesome/pro-solid-svg-icons/faMobile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createRoot } from "react-dom/client";

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector: string) {
  return new Promise<HTMLElement>((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector) as HTMLElement);
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector) as HTMLElement);
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see
    // https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

const link = "/plugin/stashreels/assets/app/";

const reelsButton = document.createElement("div");
reelsButton.id = "StashReelsButton";
reelsButton.setAttribute("data-rb-event-key", link);
reelsButton.className = "col-4 col-sm-3 col-md-2 col-lg-auto nav-link";

const ReelsButton = () => {
  const link = "/plugin/stashreels/assets/app/";

  return (
    <a
      href={link}
      className="minimal p-4 p-xl-2 d-flex d-xl-inline-block flex-column justify-content-between align-items-center btn btn-primary"
    >
      <FontAwesomeIcon
        className="fa-icon nav-menu-icon d-block d-xl-inline mb-2 mb-xl-0"
        icon={faMobile}
      />
      <span>Reels</span>
    </a>
  );
};

waitForElm(".top-nav .navbar-nav").then((elm) => {
  elm.appendChild(reelsButton);
  const root = createRoot(reelsButton!);
  root.render(<ReelsButton />);
});
