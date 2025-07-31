import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ChatAnalysis } from '@/components/ChatAnalysis';

interface Message {
  contact: string;
  message: string;
  timestamp: Date;
}

const Index = () => {
  const [chatData, setChatData] = useState<Message[] | null>(null);

  const handleFileProcessed = (messages: Message[]) => {
    setChatData(messages);
  };

  const handleReset = () => {
    setChatData(null);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {!chatData ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold gradient-text mb-4">
                Chat Wrapped
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover insights about your WhatsApp conversations
              </p>
            </div>
            <FileUpload onFileProcessed={handleFileProcessed} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Upload new chat
              </button>
            </div>
            <ChatAnalysis messages={chatData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;