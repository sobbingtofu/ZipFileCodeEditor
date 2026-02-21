import {SVGProps} from "react";

function SaveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M5 5.675C5 4.72231 5.67157 3.95 6.5 3.95H16.3787C16.7765 3.95 17.158 4.13175 17.4393 4.45524L19.5607 6.89476C19.842 7.21825 20 7.656 20 8.11452V18.325C20 19.27766 19.3284 20.05 18.5 20.05H6.5C5.67157 20.05 5 19.27766 5 18.325V5.675Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.95V9.7H15V3.95"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20.05V14.3H16V20.05"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export {SaveIcon};
