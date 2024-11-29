"use client"
import React, {createContext, useContext, useState, ReactNode} from 'react';

interface WebSocketContextValue {
  ws: WebSocket | null;
  setWs: (ws: WebSocket) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  ws: null,
  setWs: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  return (
    <WebSocketContext.Provider value={{ ws, setWs }}>
      {children}
    </WebSocketContext.Provider>
  );
};
