import React from 'react';

if (import.meta.env.DEV && JSON.parse(localStorage.getItem("enableRenderDebugging") || "false")) {
  const {default: whyDidYouRender} = await import('@welldone-software/why-did-you-render');
  console.log("Enabling why-did-you-render");
  whyDidYouRender(React, {
    // include: [/.*/],
    trackAllPureComponents: true,
    logOnDifferentValues: true,
    trackHooks: true,
  });
}