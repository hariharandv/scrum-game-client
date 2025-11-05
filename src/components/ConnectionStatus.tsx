import React, { useState, useEffect } from 'react';
import { webSocketClient } from '../services/websocket';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(webSocketClient.isConnected());
    };

    // Check initial connection status
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getStatusInfo = () => {
    if (isConnected) {
      return {
        status: 'connected',
        text: 'Live',
        color: '#38a169',
        icon: '🟢'
      };
    } else {
      return {
        status: 'disconnected',
        text: 'Offline',
        color: '#e53e3e',
        icon: '🔴'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`connection-status ${statusInfo.status} ${className}`}>
      <span className="status-icon">{statusInfo.icon}</span>
      <span className="status-text">{statusInfo.text}</span>
    </div>
  );
};