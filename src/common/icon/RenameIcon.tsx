import {SVGProps} from "react";

function RenameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="1 0.5 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M11.9 3.2L12.8 4.1C13.0928 4.39289 13.0928 4.86777 12.8 5.16066L7.15 10.8107L5 11.3L5.48934 9.15L11.1393 3.5C11.4322 3.20711 11.9071 3.20711 12.2 3.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.7 4.95L11.05 6.3" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

export {RenameIcon};
