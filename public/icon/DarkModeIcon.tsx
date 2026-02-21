import {SVGProps} from "react";

function DarkModeIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M15.5 3.8C14.397 4.819 13.7 6.264 13.7 7.875C13.7 10.964 16.26 13.475 19.41 13.475C19.934 13.475 20.442 13.406 20.924 13.278C19.781 17.074 16.155 19.85 11.85 19.85C6.616 19.85 2.35 15.672 2.35 10.525C2.35 6.165 5.405 2.516 9.533 1.45C9.291 2.079 9.162 2.761 9.162 3.475C9.162 6.564 11.722 9.075 14.872 9.075C15.092 9.075 15.31 9.063 15.523 9.037"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export {DarkModeIcon};
