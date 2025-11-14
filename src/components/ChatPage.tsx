import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { generateAnswer, speechToText, isSpeechRecognitionSupported } from '../services/ml';

interface ChatPageProps {
  selectedLanguage: string;
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  localContent?: string;
  englishContent?: string;
  timestamp: Date;
}

const languageNames: Record<string, string> = {
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  en: 'English',
};

export function ChatPage({ selectedLanguage, onBack }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSupported = isSpeechRecognitionSupported();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Use ML service to generate answer
      const response = await generateAnswer({
        question: question,
        language: selectedLanguage,
      });

      const botMessage: Message = {
        id: 'msg_' + (Date.now() + 1),
        type: 'bot',
        content: '',
        localContent: response.localLanguage.text,
        englishContent: response.english.text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating answer:', error);
      // Fallback to mock response on error
      const botMessage: Message = {
        id: 'msg_' + (Date.now() + 1),
        type: 'bot',
        content: '',
        localContent: 'Error generating response. Please try again.',
        englishContent: 'Error generating response. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    
    try {
      const response = await speechToText({
        language: selectedLanguage,
        useWebAPI: speechSupported,
      });
      
      setInputText(response.text);
      setIsRecording(false);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-gray-900">Ask Your Doubt</h2>
          <p className="text-gray-600">Learning in {languageNames[selectedLanguage]}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Mic className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Start a Conversation</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Ask any question and get bilingual explanations in {languageNames[selectedLanguage]} and English
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'user' ? (
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                <p>{message.content}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm space-y-3">
                {/* Local Language */}
                <div className="pb-3 border-b border-gray-100">
                  <div className="text-blue-600 mb-1">{languageNames[selectedLanguage]}</div>
                  <p className="text-gray-900">{message.localContent}</p>
                </div>
                {/* English */}
                <div>
                  <div className="text-blue-600 mb-1">English</div>
                  <p className="text-gray-900">{message.englishContent}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-full transition-colors ${
              isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            className="flex-1 min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="h-[44px] w-[44px] p-0 rounded-full"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}