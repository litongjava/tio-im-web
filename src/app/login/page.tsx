// pages/login/page.tsx

"use client"

import {useState} from "react";
import {useWebSocket} from "@/context/WebSocketContext";
import {useRouter} from "next/navigation";
import config from "@/config/config";

let sequenceId = 0;

function generateSequenceId() {
  sequenceId += 1;
  return sequenceId;
}

function getTimestamp() {
  return Date.now();
}

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setWs } = useWebSocket();
  const router = useRouter();

  const handleLogin = () => {
    const socket = new WebSocket(config.wsUrl);

    socket.onopen = () => {
      const loginData = {
        cmd: 3,
        sequence: generateSequenceId(),
        timestamp: getTimestamp(),
        body: {
          username,
          password,
          token,
        },
      };

      socket.send(JSON.stringify(loginData));

      // 存储 WebSocket 实例以供后续使用
      setWs(socket);
    };

    socket.onmessage = (event) => {
      // 处理服务器返回的消息
      const data = JSON.parse(event.data);

      if (data.cmd === 4) {
        if (data.code === 1) {
          // 登录成功，保存用户ID并跳转到好友列表页面
          localStorage.setItem('userId', data.body.id);
          router.push('/friends');
        } else {
          // 登录失败，显示错误信息
          setErrorMessage(data.message || '登录失败');
        }
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setErrorMessage('WebSocket连接错误');
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  };

  return (
    <div>
      <h1>登录</h1>
      <input
        type="text"
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br/>
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br/>
      <input
        type="text"
        placeholder="Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      /><br/>
      <button onClick={handleLogin}>登录</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default LoginPage;
