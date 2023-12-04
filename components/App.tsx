/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
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
  const [location, setLocation] = useState<false | Geolocation.GeoPosition>(
    false,
  );

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
      console.log('res is:', res);
      if (res) {
        Geolocation.getCurrentPosition(
          position => {
            console.log(position);
            setLocation(position);
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
            setLocation(false);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    });
    console.log(location);
  };

  return (
    <SafeAreaView style={styles.backgroundStyles}>
      <Text style={styles.headerText}>WalkTrack</Text>

      <View style={styles.locationButton}>
        <Button title="Get Location" color={'blue'} onPress={getLocation} />
      </View>

      <View style={styles.locationButton}>
        <Button title="Send Location" color={'blue'} />
      </View>

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
