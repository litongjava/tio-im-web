"use client"
import React, {createContext, useContext, useState} from 'react';

interface WebSocketContextValue {
  ws: WebSocket | null;
  setWs: (ws: WebSocket) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  ws: null,
  setWs: () => {
  },
});

export const useWebSocket = () => useContext(WebSocketContext);

// @ts-ignore
export const WebSocketProvider: React.FC = ({children}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  return (
    <WebSocketContext.Provider value={{ws, setWs}}>
      {children}
    </WebSocketContext.Provider>
  );
};
