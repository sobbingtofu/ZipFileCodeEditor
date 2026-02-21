import {SVGProps} from "react";

function AddFolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M2.8 4.4C2.8 3.84772 3.24772 3.4 3.8 3.4H6.1L7.15 4.45H12.2C12.7523 4.45 13.2 4.89772 13.2 5.45V10.3C13.2 10.8523 12.7523 11.3 12.2 11.3H3.8C3.24772 11.3 2.8 10.8523 2.8 10.3V4.4Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="13" cy="11.2" r="2.5" fill="currentColor" />
    </svg>
  );
}

export {AddFolderIcon};
