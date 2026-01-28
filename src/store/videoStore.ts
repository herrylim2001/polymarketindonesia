import { create } from 'zustand';
import { LiveStream, ChatMessage, MOCK_LIVE_STREAMS } from '@/types';
import { generateId } from '@/lib/utils';

interface VideoState {
  // Video player state
  isPlayerVisible: boolean;
  isPlayerMinimized: boolean;
  currentStream: LiveStream | null;

  // Video list modal state
  isListModalOpen: boolean;
  availableStreams: LiveStream[];

  // Chat state
  isChatOpen: boolean;
  chatMessages: ChatMessage[];

  // Gift modal state
  isGiftModalOpen: boolean;

  // Actions
  openVideoList: () => void;
  closeVideoList: () => void;
  selectStream: (stream: LiveStream) => void;
  closePlayer: () => void;
  minimizePlayer: () => void;
  maximizePlayer: () => void;
  toggleChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string, username: string) => void;
  toggleGiftModal: () => void;
  closeGiftModal: () => void;
}

// Initial mock chat messages
const initialChatMessages: ChatMessage[] = [
  { id: '1', username: 'SportsFan88', message: 'Ayo semangat!', timestamp: new Date().toISOString() },
  { id: '2', username: 'BettingPro', message: 'Bagus mainnya!', timestamp: new Date().toISOString(), isVIP: true },
  { id: '3', username: 'JakartaFan', message: 'Gol gol gol!', timestamp: new Date().toISOString() },
  { id: '4', username: 'Winner99', message: 'Siapa yang menang?', timestamp: new Date().toISOString() },
  { id: '5', username: 'LiveBet', message: 'Mantap streamnya!', timestamp: new Date().toISOString(), isVIP: true },
];

export const useVideoStore = create<VideoState>((set, get) => ({
  // Initial state
  isPlayerVisible: false,
  isPlayerMinimized: false,
  currentStream: null,
  isListModalOpen: false,
  availableStreams: MOCK_LIVE_STREAMS,
  isChatOpen: false,
  chatMessages: initialChatMessages,
  isGiftModalOpen: false,

  // Actions
  openVideoList: () => {
    set({ isListModalOpen: true });
  },

  closeVideoList: () => {
    set({ isListModalOpen: false });
  },

  selectStream: (stream: LiveStream) => {
    set({
      currentStream: stream,
      isPlayerVisible: true,
      isPlayerMinimized: false,
      isListModalOpen: false,
    });
  },

  closePlayer: () => {
    set({
      isPlayerVisible: false,
      currentStream: null,
      isChatOpen: false,
      isGiftModalOpen: false,
    });
  },

  minimizePlayer: () => {
    set({ isPlayerMinimized: true });
  },

  maximizePlayer: () => {
    set({ isPlayerMinimized: false });
  },

  toggleChat: () => {
    const { isChatOpen } = get();
    set({
      isChatOpen: !isChatOpen,
      isGiftModalOpen: false, // Close gift modal when opening chat
    });
  },

  closeChat: () => {
    set({ isChatOpen: false });
  },

  sendMessage: (message: string, username: string) => {
    const { chatMessages } = get();
    const newMessage: ChatMessage = {
      id: generateId(),
      username,
      message,
      timestamp: new Date().toISOString(),
    };
    set({ chatMessages: [...chatMessages, newMessage] });
  },

  toggleGiftModal: () => {
    const { isGiftModalOpen } = get();
    set({
      isGiftModalOpen: !isGiftModalOpen,
      isChatOpen: false, // Close chat when opening gift modal
    });
  },

  closeGiftModal: () => {
    set({ isGiftModalOpen: false });
  },
}));
