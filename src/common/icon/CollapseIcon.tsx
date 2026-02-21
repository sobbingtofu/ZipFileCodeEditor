import {SVGProps} from "react";

function CollapseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M3.5 2.5H9.5C10.0523 2.5 10.5 2.94772 10.5 3.5V9.5C10.5 10.0523 10.0523 10.5 9.5 10.5H3.5C2.94772 10.5 2.5 10.0523 2.5 9.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 5.5H12.5C13.0523 5.5 13.5 5.94772 13.5 6.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H6.5C5.94772 13.5 5.5 13.0523 5.5 12.5V10.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.4 6.5H8.6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

export {CollapseIcon};
