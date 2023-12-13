import {useEffect, useRef, useState} from 'react';
import {GeolocationServerLocationSyncResponse} from '../definitions/socket-server';
import {useGeolocation} from './useGeolocation';

export const useGeolocationServer = (url: string) => {
  // The maximum amount of times to retry the WebSocket connection
  const MAX_RETRIES = 20;

  const geolocation = useGeolocation();

  // TODO: Add a walk object to keep track of the users walk (instead of just the walkId and duration)
  // The users ongoing walk (if there is one)
  const [walkId, setWalkId] = useState<null | String>(null);
  // Duration of the users ongoing walk
  const [walkDurationSec, setwalkDurationSec] = useState<number>(0);

  // If we should retry the connection
  const [shouldRetry, setShouldRetry] = useState<boolean>(false);
  // Retry count for WebSocket connection
  const [retryCount, setRetryCount] = useState<number>(0);

  // Connection status of the WebSocket
  const [connectionStatus, setConnectionStatus] = useState<number>(0);
  // The time at which the location was last synced with the geolocation server
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  // The last message received from the WebSocket server
  const [message, setMessage] =
    useState<GeolocationServerLocationSyncResponse | null>(null);

  const ws = useRef<WebSocket>();

  // Setup WebSocket connection and add event listeners
  useEffect(() => {
    setConnectionStatus(ws.current?.readyState || 0);
    // We should only create the WebSocket connection if it does not exist / is closed
    if (ws.current && ws.current?.readyState !== WebSocket.CLOSED) {
      return;
    }

    // Create a new WebSocket connection if one does not exist
    ws.current = new WebSocket(url);
    console.log('Ready state', ws.current.readyState);

    ws.current.onopen = () => {
      console.log('WS connected, readyState: ', ws.current?.readyState);
      ws.current?.send(`Client established connection at ${Date.now()}`);
    };

    ws.current.onmessage = event => {
      console.log(event.data, typeof event.data);
      // Try to parse response as JSON
      try {
        // Determine message kind
        const response = JSON.parse(
          event.data,
        ) as GeolocationServerLocationSyncResponse;

        // If the response is a success, set the last sync time
        if (response.status === 1) {
          console.log('Success', response.timestamp);
          setLastSyncTime(response.timestamp);
        }

        // Update message
        setMessage(response);
      } catch (error) {
        console.log('Error parsing JSON', error);
        return;
      }
    };

    ws.current.onerror = event => {
      console.log('Error occured!', event);
      if (retryCount <= MAX_RETRIES) {
        // Schedule a retry
        setTimeout(() => {
          console.log(`Retrying (${retryCount})...`);
          setShouldRetry(true);
          setRetryCount(retryCount + 1);
        }, 3000);
      }
    };

    ws.current.close = () => {
      console.log('Closed websocket');
    };

    return () => {
      setShouldRetry(false);
      ws.current?.close();
    };
  }, [url, retryCount, shouldRetry, ws.current?.readyState]);

  // Setup interval to sync location with walktrack server
  useEffect(() => {
    // Only add sync interval if the connection is open, there is currently a walkId
    if (ws.current?.readyState !== WebSocket.OPEN || !walkId) {
      console.log('Not adding location sync interval', ws.current?.readyState);
      return;
    }
    console.log('Adding location sync interval');

    const syncInterval = setInterval(() => {
      // If the connection is open
      if (ws.current?.readyState === WebSocket.OPEN) {
        // If we have a current location, send it to the server
        if (geolocation.location.current) {
          ws.current?.send(JSON.stringify(geolocation.location.current));
          console.log('Sent location to server');
        } else {
          console.log('Cannot send location, no location available.');
        }
      }
    }, 5000);

    return () => {
      console.log('Clearing location sync interval');
      clearInterval(syncInterval);
    };
  }, [geolocation.location, ws.current?.readyState, walkId]);

  useEffect(() => {
    let walkDurationSecInterval: NodeJS.Timeout;
    if (walkId) {
      console.log('Adding walk duration interval');
      // Create interval to update walk duration
      walkDurationSecInterval = setInterval(() => {
        setwalkDurationSec(duration => duration + 1);
      }, 1000);
    }

    return () => {
      console.log('Clearing walk duration interval');
      clearInterval(walkDurationSecInterval);
    };
  }, [walkId]);

  function beginWalk() {
    if (walkId) {
      console.log('Cannot begin walk, already walking', walkId);
      return;
    }
    // Todo: Generate a unique walkId (in a better way than this)
    const newWalkId = (
      (Math.random() * 1000).toString() + (Math.random() * 1000).toString()
    )
      .replaceAll('.', '')
      .substring(0, 20);

    console.log('Beginning walk with id', newWalkId);
    setWalkId(newWalkId);
  }

  function endWalk() {
    console.log('Ending walk with id', walkId);
    setWalkId(null);
    setwalkDurationSec(0);
  }

  return {
    beginWalk,
    endWalk,
    message,
    connectionStatus,
    ws: ws.current!,
    lastSyncTime,
    walkId,
    walkDurationSec,
    geolocation,
    sendMessage: (msg: string) => ws.current?.send(msg),
  };
};
