import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io, { Socket } from 'socket.io-client';
import { QUERY_KEYS } from '../../../constants';

/**
 * Hook for managing real-time logs via WebSocket
 */
export function useLogsRealtime(enabled: boolean) {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (enabled) {
      const apiUrl = import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_DEV_API_PORT || 3001}` : '';
      const newSocket = io(apiUrl, {
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        newSocket.emit('subscribe', 'logs');
      });

      newSocket.on('log', (_logData: { message: string }) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOGS() });
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    return undefined;
  }, [enabled, queryClient, socket]);

  return socket;
}

/**
 * Hook for auto-scrolling logs table
 */
export function useLogsAutoScroll(
  enabled: boolean,
  autoScroll: boolean,
  logs: unknown[],
  tableRef: React.RefObject<HTMLDivElement>
) {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoScroll && enabled && logs.length > 0) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        const tableBody = tableRef.current?.querySelector('.ant-table-body');
        if (tableBody) {
          tableBody.scrollTop = tableBody.scrollHeight;
        }
      }, 100);
    }
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [logs, autoScroll, enabled, tableRef]);
}

