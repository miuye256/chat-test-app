import Link from 'next/link';

export default async function HomePage() {
  const res = await fetch('http://localhost:8000/start_chat', {
    method: 'POST',
  });
  const id = await res.json();
  return (
    <div className="text-center">
      <Link rel="" href={`/chat/${id.chat_id}`}>
        chat
      </Link>
    </div>
  );
}
