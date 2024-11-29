"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/context/WebSocketContext";

let sequenceId = 0;

function generateSequenceId() {
  sequenceId += 1;
  return sequenceId;
}

function getTimestamp() {
  return Date.now();
}

interface Message {
  cmd: number;
  sequence: number;
  to: string;
  timestamp: number;
  body: {
    msgType: string;
    content: {
      text: string;
    };
  };
  from?: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const { ws } = useWebSocket();
  const router = useRouter();
  const [mtime, setMtime] = useState("");

  // 使用 URLSearchParams 代替 useSearchParams
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserId(params.get("userId"));
  }, []);

  useEffect(() => {
    if (!ws) {
      router.push("/login");
      return;
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.cmd === 11 && data.from === userId) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  }, [ws, userId]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = ("0" + now.getMinutes()).slice(-2);
      const seconds = ("0" + now.getSeconds()).slice(-2);
      setMtime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSendMessage = () => {
    if (ws && userId && messageText) {
      const message: Message = {
        cmd: 11,
        sequence: generateSequenceId(),
        to: userId,
        timestamp: getTimestamp(),
        body: {
          msgType: "text",
          content: {
            text: messageText,
          },
        },
      };

      ws.send(JSON.stringify(message));
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessageText("");
    }
  };

  return (
    <div id="container">
      <div className="header">
        <span style={{ float: "left" }}>微信聊天界面</span>
        <span id="mtime" style={{ float: "right" }}>{mtime}</span>
      </div>
      <ul className="content">
        {messages.map((msg, index) => {
          const isSelf = msg.to === userId;
          const imgClass = isSelf ? "imgright" : "imgleft";
          const spanClass = isSelf ? "spanright" : "spanleft";
          const nickClass = isSelf ? "nickright" : "nickleft";
          const imgSrc = isSelf ? "/image/t2.jpg" : "/image/t1.jpg";
          return (
            <li key={index}>
              <img src={imgSrc} className={imgClass} />
              <span className={nickClass}>{isSelf ? "我" : msg.from || "对方"}</span>
              <span className={spanClass}>{msg.body.content.text}</span>
            </li>
          );
        })}
      </ul>
      <div className="footer">
        <div id="user_face_icon">
          <img src="/image/t2.jpg" alt="" />
        </div>
        <input
          id="messageText"
          type="text"
          placeholder="说点什么吧..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <span id="btn" onClick={handleSendMessage}>
          发送
        </span>
      </div>
    </div>
  );
};

export default ChatPage;
