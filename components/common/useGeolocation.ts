import {useEffect, useRef} from 'react';
import {PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const useGeolocation = () => {
  // state to hold location
  const location = useRef<null | Geolocation.GeoPosition>(null);
  const locationUpdateIntervalMS = useRef<number>(4_000);

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
      if (granted === 'granted') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  // Set up the geolocation observer
  useEffect(() => {
    const result = requestLocationPermission();
    if (!result) {
      return;
    }

    const watchId = Geolocation.watchPosition(
      position => {
        console.log('GEOLOCATION Updated:', position.timestamp);
        location.current = position;
      },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        interval: locationUpdateIntervalMS.current,
        distanceFilter: 0,
        fastestInterval: 3_000,
      },
    );

    return () => {
      console.log('GEOLOCATION: Watch cleared');
      Geolocation.clearWatch(watchId);
    };
  }, []);

  return {
    location,
    locationUpdateIntervalMS,
  };
};
