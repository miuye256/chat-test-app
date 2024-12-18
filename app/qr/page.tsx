// app/qr/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function QRPage() {
  const router = useRouter();

  useEffect(() => {
    // ページマウント時にstart_chatを叩く
    const startChat = async () => {
      const res = await fetch('http://localhost:8000/start_chat', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.chat_id) {
        // chat_id取得後、/chat/{chat_id}へリダイレクト
        router.push(`/chat/${data.chat_id}`);
      }
    };

    startChat();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      {/* ローディング表示など */}
      <p>チャットを準備中です...</p>
    </div>
  );
}
