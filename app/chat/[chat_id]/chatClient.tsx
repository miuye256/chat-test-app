'use client';
import { useState, useEffect, useRef } from 'react';

interface Message {
  sender: 'user' | 'bot';
  content: string;
}

export default function ChatClient({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ローディング状態

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        content: 'こんにちは。私はこのお店のメニューについての質問にお答えするチャットボットです。',
      },
      {
        sender: 'bot',
        content: 'ハラール対応のメニューやアレルギー情報が知りたい場合はお尋ねください。',
      },
      {
        sender: 'bot',
        content: 'お店のご予約などには対応しておりませんのでご了承ください。',
      },
    ]);
  }, [chatId]);

  useEffect(() => {
    // メッセージが更新されたらスクロールを下に
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // textarea の高さを自動調整
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = { sender: 'user', content: inputValue };
    setMessages((msgs) => [...msgs, userMessage]);
    setInputValue('');
    setIsLoading(true); // ローディング開始

    try {
      const res = await fetch(`http://localhost:8000/chat/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage.content }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let partial = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          partial += decoder.decode(value, { stream: true });
          const lines = partial.split('\n');
          partial = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() !== '') {
              const jsonData = JSON.parse(line);
              if (jsonData.content) {
                const botMessage: Message = { sender: 'bot', content: jsonData.content };
                setMessages((msgs) => [...msgs, botMessage]);
              }
            }
          }
        }

        // 最後に溜まっているpartialがあれば処理
        if (partial.trim() !== '') {
          const jsonData = JSON.parse(partial);
          if (jsonData.content) {
            const botMessage: Message = { sender: 'bot', content: jsonData.content };
            setMessages((msgs) => [...msgs, botMessage]);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        sender: 'bot',
        content: 'エラーが発生しました。再度お試しください。',
      };
      setMessages((msgs) => [...msgs, errorMessage]);
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Macの場合は「Cmd + Enter」、Windows/Linuxの場合は「Ctrl + Enter」を検出
      const isCmdOrCtrlPressed = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrlPressed) {
        e.preventDefault(); // デフォルトの動作（改行）を防止
        sendMessage(); // メッセージを送信
      }
      // それ以外の場合はデフォルトの動作（改行）を許可
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-lg px-4 py-2 rounded-lg shadow ${
                m.sender === 'user'
                  ? 'bg-blue-500 text-white ml-10' // 左側にマージンを追加
                  : 'bg-gray-200 text-gray-800 mr-10' // 右側にマージンを追加
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ送信フォーム */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-200 p-4 border-t border-gray-300">
        <div className="flex items-end">
          {' '}
          {/* items-end で下揃え */}
          <textarea
            ref={textareaRef}
            rows={1}
            className="flex-1 border border-gray-300 rounded-3xl p-2 focus:outline-none focus:border-blue-500 resize-none overflow-hidden min-h-[40px] max-h-[200px] bg-white"
            placeholder="メッセージを入力..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none flex-shrink-0 ${
              !inputValue.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? '送信中...' : '送信'}
          </button>
        </div>
      </div>
    </div>
  );
}
