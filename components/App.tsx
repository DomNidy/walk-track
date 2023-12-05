/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  PermissionsAndroid,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
function App(): JSX.Element {
  // state to hold location
  const [location, setLocation] = useState<null | Geolocation.GeoPosition>(
    null,
  );

  const [connectionStatus, setConectionStatus] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [locationUpdateIntervalMS] = useState<number>(1_000);

  useEffect(() => {
    setConectionStatus(!!ws && ws?.readyState === WebSocket.OPEN);
  }, [ws, ws?.readyState]);

  useEffect(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const newsocket = new WebSocket('ws://10.0.2.2:8080');

    console.log('ws', newsocket.readyState);

    newsocket.onopen = () => {
      // connection opened
      console.log('opened');
      newsocket.send('something'); // send a message
      setConectionStatus(true);
    };

    newsocket.onclose = e => {
      // connection closed
      console.log('closed', e.code, e.reason);
      setConectionStatus(false);
    };

    newsocket.onmessage = e => {
      // a message was received
      console.log(e.data);
    };

    setWs(newsocket);

    return () => {
      newsocket.close();
    };
  }, [ws?.readyState]);

  // Function to get permission for location
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('granted', granted);
      if (granted === 'granted') {
        console.log('You can use Geolocation');
        return true;
      } else {
        console.log('You cannot use Geolocation');
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  // function to check permissions and get Location
  const getLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      if (res) {
        Geolocation.watchPosition(
          position => {
            setLocation(position);
          },
          error => {
            console.log(error);
          },
          {
            enableHighAccuracy: true,
            interval: locationUpdateIntervalMS,
          },
        );
      }
    });
  };

  // Routinely send location to server
  useEffect(() => {
    const sendLocationInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(location));
      } else {
        console.log("Not connected, can't send location");
      }
    }, locationUpdateIntervalMS);

    return () => clearInterval(sendLocationInterval);
  }, [location, locationUpdateIntervalMS, ws]);

  function formatTimeDifference(timestamp: number) {
    const lastUpdated = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / 1000,
    );
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours > 0) {
      return `${diffInHours} hours`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minutes`;
    } else {
      return `${diffInSeconds} seconds`;
    }
  }
  return (
    <SafeAreaView style={styles.backgroundStyles}>
      <Text style={styles.headerText}>WalkTrack</Text>
      {connectionStatus ? (
        <>
          <Text style={styles.locationText}>Connected</Text>
        </>
      ) : (
        <>
          <Text style={styles.locationText}>
            Not Connected ({ws?.readyState})
          </Text>
        </>
      )}

      <View style={styles.locationButton}>
        <Button title="Get Location" color={'blue'} onPress={getLocation} />
      </View>

      <Text style={styles.locationText}>
        Last Updated: {location && formatTimeDifference(location.timestamp)}
      </Text>
      <Text style={styles.locationText}>
        Latitude: {location && location.coords.latitude.toString()}
      </Text>
      <Text style={styles.locationText}>
        Longitude: {location && location.coords.longitude.toString()}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    color: '#f3f3f3',
    fontStyle: 'normal',
    fontSize: 45,
  },

  locationText: {
    color: '#f3f3f3',
    fontStyle: 'normal',
    fontSize: 22,
  },

  backgroundStyles: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: '#212529',
    borderWidth: 3,
    borderColor: 'black',
    padding: 30,
    width: `${100}%`,
    height: `${100}%`,
    gap: 20,
  },

  locationButton: {
    padding: 1,
    width: 125,
    height: 'auto',
  },
});

export default App;
