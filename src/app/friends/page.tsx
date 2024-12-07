"use client"

import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {useWebSocket} from "@/context/WebSocketContext";
import config from "@/config/config";

const FriendsListPage = () => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { ws } = useWebSocket();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  function getOnlineUser() {
    // 获取在线用户

    fetch(config.server + '/api/v1/im/onlineUsers')
      .then((response) => response.json())
      .then((data) => {
        if(data?.data){
          setOnlineUsers(data.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching online users:', error);
      });
  }

  useEffect(() => {
    if (!ws) {
      // 如果没有 WebSocket 连接，重定向到登录页面
      router.push('/login');
      return;
    }

    // 从 localStorage 中获取当前用户ID
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);

    getOnlineUser();
  }, [ws]);

  const handleSelectUser = (userId: string) => {
    // 选择用户后跳转到聊天页面
    router.push(`/chat?userId=${userId}`);
  };

  return (
    <div>
      <h1>在线用户列表</h1>
      <button onClick={() => getOnlineUser()}>刷新</button>
      <ul>
        {onlineUsers.map((userId) => (
          <li key={userId}>
            用户ID: {userId}
            {userId === currentUserId ? ' (current user)' : <button onClick={() => handleSelectUser(userId)}>聊天</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsListPage;
