import {SVGProps} from "react";

function AddFileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="-0.8 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M4 2.5H8.4L10.3 4.4V10.5C10.3 11.0523 9.85228 11.5 9.3 11.5H4C3.44772 11.5 3 11.0523 3 10.5V3.5C3 2.94772 3.44772 2.5 4 2.5Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 2.5V4.4H10.3"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="10.3" cy="11.2" r="2.5" fill="currentColor" />
    </svg>
  );
}

export {AddFileIcon};
