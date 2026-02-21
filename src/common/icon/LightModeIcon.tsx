import {SVGProps} from "react";

function LightModeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3V5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18.5V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 12H5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.5 12H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.64 5.64L7.41 7.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.59 16.59L18.36 18.36" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.64 18.36L7.41 16.59" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.59 7.41L18.36 5.64" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export {LightModeIcon};
