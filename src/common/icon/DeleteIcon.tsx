import {SVGProps} from "react";

function DeleteIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3.5 4.5H12.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6 4.5V3.5C6 2.94772 6.44772 2.5 7 2.5H9C9.55228 2.5 10 2.94772 10 3.5V4.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 4.5L5.1 12.3C5.14322 12.8593 5.60927 13.3 6.17 13.3H9.83C10.3907 13.3 10.8568 12.8593 10.9 12.3L11.5 4.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 6.7V10.7" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M9 6.7V10.7" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

export {DeleteIcon};
