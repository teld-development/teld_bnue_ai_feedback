import "./globals.css";

export const metadata = {
  title: "AI 기반 수업실연 피드백 시스템",
  description: "Dummy login and dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
