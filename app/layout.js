import "./globals.css";


export const metadata = {
  title: "2D Sprite Creator",
  description: "Midterm Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
