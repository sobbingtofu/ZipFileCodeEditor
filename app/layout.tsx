import type {Metadata} from "next";
import type {ReactNode} from "react";
import "./globals.css";
import StyledComponentsRegistry from "@/src/styledComponentsRegistry";

export const metadata: Metadata = {
  title: "Simple Code Editor - 코드베이스 Zip 파일 편집기",
  description: "Zip 파일 형태로 코드베이스를 업로드하고, 편집하고, 다운로드 받으세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
