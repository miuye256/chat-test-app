import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 min-h-screen">
        <header className="fixed top-0 left-0 right-0 bg-gray-100 p-2 pl-4 border-b border-gray-300 text-star-t">
          <h1 className="text-xl font-bold text-gray-700">テストチャットアプリ</h1>
        </header>
        <main className="py-12">{children}</main>
      </body>
    </html>
  );
}
