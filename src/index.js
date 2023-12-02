import React, { createRef } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Viewer from "./components/Viewer";
import Viewer2 from "./components/Viewer2";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import EntryPage from "./components/EntryPage";
// import "./i18n";
const PanelRef = createRef();
if (process.env.NODE_ENV !== "production") {
  renderReactComponent("root");
  // setTimeout(() => {
  //   reactinitDCScene("IMPERIAL");
  //   reactComp().submitClick();
  // }, 1000);
}

export function renderReactComponent(divId, filePath, postQuote) {
  const router = createBrowserRouter([
    {
      path: "/",
      errorElement: <></>,
      element: <EntryPage />,
    },
    {
      path: "/Home",
      errorElement: <></>,
      element: (
        <Viewer2
          isIFrame={process.env.NODE_ENV === "production"}
          ref={PanelRef}
          filePath={filePath}
          CanvasID={divId + "Canvas"}
          postQuote={postQuote}
        />
      ),
    },
  ]);
  console.log("rendering js", divId);
  const root = createRoot(document.getElementById(divId));
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export function reactComp() {
  return PanelRef.current;
}
export function reactinitDCScene() {
  return PanelRef.current.initCanvas();
}
window.locker = {
  renderReactComponent,
  reactComp,
  reactinitDCScene,
};
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
