import React, { MouseEvent } from "react";

export function focusMainContent(
  e: MouseEvent<HTMLAnchorElement>,
  mainRef: React.RefObject<HTMLDivElement | null>
) {
  e.preventDefault();

  const firstHeadingElement = document?.getElementsByTagName("h1")?.[0];
  if (firstHeadingElement) {
    manageFocus(firstHeadingElement);
  } else if (mainRef && mainRef.current) {
    manageFocus(mainRef.current);
  }
}

function manageFocus(element: HTMLElement): void {
  if (document?.activeElement === element) {
    return;
  }

  if (!element.hasAttribute("tabIndex")) {
    element.setAttribute("tabIndex", "-1");
    element.addEventListener(
      "blur",
      (e) => {
        e.preventDefault();
        element.removeAttribute("tabIndex");
      },
      { once: true }
    );
  }

  element.focus();
}
