/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Button, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import {useGeolocationServer} from './common/useGeolocationServer';
function App(): JSX.Element {
  // state to hold location
  const socket = useGeolocationServer('ws://10.0.2.2:8080');

  // function formatTimeDifference(timestamp: number) {
  //   const lastUpdated = new Date(timestamp);
  //   const now = new Date();
  //   const diffInSeconds = Math.floor(
  //     (now.getTime() - lastUpdated.getTime()) / 1000,
  //   );
  //   const diffInMinutes = Math.floor(diffInSeconds / 60);
  //   const diffInHours = Math.floor(diffInMinutes / 60);

  //   if (diffInHours > 0) {
  //     return `${diffInHours} hours`;
  //   } else if (diffInMinutes > 0) {
  //     return `${diffInMinutes} minutes`;
  //   } else {
  //     return `${diffInSeconds} seconds`;
  //   }
  // }
  return (
    <SafeAreaView style={styles.backgroundStyles}>
      <Text style={styles.headerText}>WalkTrack</Text>
      {socket.connectionStatus ? (
        <>
          <Text style={styles.textLabel}>Connected</Text>
        </>
      ) : (
        <>
          <Text style={styles.textLabel}>Not Connected</Text>
        </>
      )}

      {socket.geolocation?.location?.current && (
        <View>
          <Text style={styles.textLabel}>
            Last Sync:{' '}
            <Text style={styles.textData}>{socket.lastSyncTime}</Text>
          </Text>
          <Text style={styles.textLabel}>
            Lat/Long:{' '}
            <Text style={styles.textData}>
              (
              {socket.geolocation?.location?.current &&
                socket.geolocation.location.current.coords.latitude.toFixed(5)}
              ,{' '}
              {socket.geolocation?.location?.current &&
                socket.geolocation.location.current.coords.longitude.toFixed(5)}
              )
            </Text>
          </Text>
        </View>
      )}

      {socket.walkId && (
        <View>
          <Text style={styles.textLabel}>
            WalkID: <Text style={styles.textData}>{socket.walkId}</Text>
          </Text>
          <Text style={styles.textLabel}>
            Duration:{' '}
            <Text style={styles.textData}>
              {Math.floor(socket.walkDurationSec / 60)
                .toString()
                .padStart(2, '0')}
              :{(socket.walkDurationSec % 60).toString().padStart(2, '0')}
            </Text>
          </Text>
        </View>
      )}

      {!socket.walkId ? (
        <Button
          title="Begin Walk"
          onPress={() => socket.beginWalk()}
          disabled={!!socket.walkId}
          color={'green'}
        />
      ) : (
        <Button
          title="End Walk"
          onPress={() => socket.endWalk()}
          disabled={!socket.walkId}
          color={'red'}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    color: '#f3f3f3',
    fontStyle: 'normal',
    fontSize: 45,
    letterSpacing: -2,
    fontWeight: '600',
  },

  textLabel: {
    color: '#f3f3f3',
    fontWeight: '600',
    fontSize: 22,
    letterSpacing: -0.5,
  },

  textData: {
    color: '#f3f3f3',
    fontWeight: '400',
    fontSize: 20,
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

  locationButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 1,
    width: 'auto',
    height: 'auto',
  },
});

export default App;
