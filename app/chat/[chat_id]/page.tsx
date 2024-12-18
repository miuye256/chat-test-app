// app/chat/[chat_id]/page.tsx (Server Component)
import ChatClient from './chatClient';

export default function Page({ params }: { params: { chat_id: string } }) {
  const { chat_id } = params; // サーバーコンポーネントなので直接アクセス可能
  return <ChatClient chatId={chat_id} />;
}
