

import React, { useState, useEffect, useRef } from 'react';

import { useJsApiLoader, GoogleMap, Autocomplete, DirectionsRenderer, Marker } from '@react-google-maps/api';
import './index.css';


const libraries = ["places", "geocoding", "geometry"];

export const Map = ({ origin, destination, driverName, numberPlate, selectedSeats, PhoneNo, currentBusPosition, timeRemaining, setBusPosition, busDeparted }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
const [totalDistance, setTotalDistance] = useState(0);
 const [totalTimeInSeconds, setTotalTimeInSeconds] = useState(0);
   const [totalDistanceInMeters, setTotalDistanceInMeters] = useState(0);
   const [timeRemainingToDestination, setTimeRemainingToDestination] = useState(0);

   const [geometryLibraryLoaded, setGeometryLibraryLoaded] = useState(false);
 const [isAnimating, setIsAnimating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [busRoutePositions, setBusRoutePositions] = useState([]);

  const originRef = useRef();
  const destinationRef = useRef();
   const timeRemainingRef = useRef(timeRemaining);
  const animationIntervalRef = useRef();


const convertDurationToSeconds = (duration) => {
  // Regular expression to match the format "X hours Y mins"
  const regex = /(\d+)\s*hours\s*(\d+)\s*mins/;

  const match = duration.match(regex);

  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = hours * 3600 + minutes * 60;
    return seconds;
  }

  // If the regex pattern doesn't match, try parsing as HH:mm:ss format
  const timeParts = duration.split(':').map(Number);

  if (timeParts.length === 3) {
    const hours = timeParts[0];
    const minutes = timeParts[1];
    const seconds = timeParts[2];
    return hours * 3600 + minutes * 60 + seconds;
  } else if (timeParts.length === 2) {
    const minutes = timeParts[0];
    const seconds = timeParts[1];
    return minutes * 60 + seconds;
  }

  return NaN; // Invalid duration format
};




  const { isLoaded} = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCivwKyWPJekwIy1H7y4EHkmE3FgC005Ng",
     libraries: libraries,
      onLoad: () => {
    setGeometryLibraryLoaded(true);
  },
  });




  useEffect(() => {
    // Get current location coordinates

       
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }, []);


     useEffect(() => {
    // Convert origin and destination to coordinates
    if (origin && destination) {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: origin }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          const originLocation = results[0].geometry.location;
          originRef.current = originLocation;
          setBusPosition(originLocation); // Set the initial bus position
        }
      });

      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          const destinationLocation = results[0].geometry.location;
          destinationRef.current = destinationLocation;
        }
      });
    }
  }, [origin, destination]);

  useEffect(() => {
    // Calculate route and distance when we have both origin and destination coordinates
    if (originRef.current && destinationRef.current) {
      calculateRoute(originRef.current, destinationRef.current);
    }
  }, [originRef.current, destinationRef.current, selectedSeats, setBusPosition]);


 useEffect(() => {
    // Log values for debugging
    console.log('currentBusPosition:', currentBusPosition);
    console.log('originRef:', originRef.current);
    console.log('destinationRef:', destinationRef.current);
    console.log('timeRemaining:', timeRemaining);
    console.log('totalTimeInSeconds:', totalTimeInSeconds);
    console.log('totalDistanceInMeters:', totalDistanceInMeters);
    console.log('busDeparted:', busDeparted);
  }, [currentBusPosition, timeRemaining, totalTimeInSeconds, totalDistanceInMeters, busDeparted]);


const calculateRoute = async (origin, destination) => {
  if (!origin || !destination) {
    return;
  }

  const directionsService = new window.google.maps.DirectionsService();
  const results = await directionsService.route({
    origin,
    destination,
    travelMode: window.google.maps.TravelMode.DRIVING
  });

  setDirectionsResponse(results);
  setDistance(results.routes[0].legs[0].distance.text);
  setDuration(results.routes[0].legs[0].duration.text);

  // Store the route positions in an array
  const positions = results.routes[0].overview_path;
  setBusRoutePositions(positions);
   
// Calculate total time in seconds
  const totalTimeInSeconds = convertDurationToSeconds(results.routes[0].legs[0].duration.text);
  console.log('Total Time in Seconds:', totalTimeInSeconds); // Add this line to check totalTimeInSeconds
  setTotalTimeInSeconds(totalTimeInSeconds);
  
  // Calculate total distance using the DirectionsResult object
  const totalDistanceInMeters = results.routes[0].legs[0].distance.value;
  const totalDistanceInKilometers = totalDistanceInMeters / 1000;
  setTotalDistance(totalDistanceInKilometers); // Add this state variable to your component using useState
  setTotalDistanceInMeters(totalDistanceInMeters);
 
  
  
};

  const calculateTimeRemainingToDestination = () => {
    if (!currentBusPosition || !geometryLibraryLoaded) {
      return totalTimeInSeconds; // Bus hasn't departed yet, return the total time
    }

    if (!window.google || !window.google.maps || !window.google.maps.geometry || !window.google.maps.geometry.spherical) {
      // Google Maps Geometry Library not loaded yet, return totalTimeInSeconds
      return totalTimeInSeconds;
    }

    // Calculate the distance remaining to reach the destination (in meters)
    const distanceToDestination = window.google.maps.geometry.spherical.computeDistanceBetween(
      currentBusPosition,
      destinationRef.current
    );

    // Calculate the time remaining to reach the destination (in seconds) based on the current speed
    const speedInMetersPerSecond = totalDistanceInMeters / totalTimeInSeconds;
    const timeRemainingInSeconds = distanceToDestination / speedInMetersPerSecond;

    return Math.max(timeRemainingInSeconds, 0); // Ensure non-negative value
  };


 const calculateDistanceTraveled = () => {
  if (!busDeparted) {
    return 0; // Bus has not departed yet, return 0 distance traveled
  }

  // Calculate time elapsed since departure (in seconds)
  const timeElapsedInSeconds = totalTimeInSeconds - timeRemainingToDestination;

  // Calculate speed in m/s
  const speedInMetersPerSecond = totalDistanceInMeters / totalTimeInSeconds;

  // Calculate distance traveled based on time elapsed and speed
  const distanceTraveled = speedInMetersPerSecond * timeElapsedInSeconds;

  return distanceTraveled;
};

  useEffect(() => {
    // Update the timeRemainingRef when timeRemaining state changes
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);
  

  useEffect(() => {
    // Start animation
    if (busDeparted && currentBusPosition) {
      setIsAnimating(true); // Set isAnimating to true when the bus departs

      // Calculate the animation duration based on timeRemainingToDestination
      const animationDuration = totalTimeInSeconds;

      // Get the start time for the animation
      const startTime = Date.now();

      // Start the animation using requestAnimationFrame
      const animateMarker = () => {
        // Calculate the elapsed time since the animation started
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        // Calculate the percentage of the animation completed
        const animationProgress = elapsedTime / (animationDuration * 1000);

        // If the animation is not completed, update the marker position
        if (animationProgress < 1) {
           if (window.google && window.google.maps && window.google.maps.geometry && window.google.maps.geometry.spherical) {
          // Calculate the current position of the marker based on the animation progress
          const newPosition = window.google.maps.geometry.spherical.interpolate(
            currentBusPosition,
            destinationRef.current,
            animationProgress
          );

          // Update the position of the marker
          setBusPosition(newPosition);
           // Calculate the updated time remaining based on time elapsed
    const updatedTimeRemaining = (1 - animationProgress) * totalTimeInSeconds;
    setTimeRemainingToDestination(updatedTimeRemaining);

    // Calculate the updated distance remaining based on time elapsed and speed
    const updatedDistanceRemaining = updatedTimeRemaining * (totalDistanceInMeters / totalTimeInSeconds);
    console.log('Time Remaining:', updatedTimeRemaining.toFixed(2), 'seconds');
    console.log('Distance Remaining:', (updatedDistanceRemaining / 1000).toFixed(2), 'kilometers');

        } else {
    // Library not loaded yet, continue the animation in the next frame
    animationIntervalRef.current = requestAnimationFrame(animateMarker);
          } 
        } else {
          // If the animation is completed, stop the animation and set the marker to the final destination
          setIsAnimating(false);
          setBusPosition(destinationRef.current);
        }
      };

      // Start the animation
      animationIntervalRef.current = requestAnimationFrame(animateMarker);

      // Clean up the animation interval when the component unmounts
      return () => cancelAnimationFrame(animationIntervalRef.current);
    }
  }, [ currentBusPosition, timeRemainingToDestination, setBusPosition, busDeparted]);



 useEffect(() => {
    // Calculate the time remaining for the bus to reach its destination
    const timeRemainingToDestination = calculateTimeRemainingToDestination();
    setTimeRemainingToDestination(timeRemainingToDestination);

  }, []);
    return (
    <div>
      <h3>Map</h3>
    

      <div className="map-container">
        <GoogleMap
          zoom={14}
          center={currentLocation}
          mapContainerClassName="map-container"
          options={{
            zoomControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
          }}
        >
          {/* Display current location marker */}
          {currentLocation && (
            <Marker position={currentLocation} />
          )}
          {/* Display origin and destination markers */}
          {origin && (
            <Marker position={origin} label="Origin" />
          )
          
          }
          {destination && (
            <Marker position={destination} label="Destination" />
          )}
          
          {/* Display directions */}
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}

      {/* Display directions */}
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
{/* Display current bus position with animation */}
{busDeparted && isAnimating && currentBusPosition && (
  <Marker
    position={currentBusPosition}
    label="Bus"
    animation={window.google.maps.Animation.DROP}
  />
)}

{/* Display current bus position */}
{!busDeparted && currentBusPosition && (
  <Marker position={currentBusPosition} label="Bus (Not Departed)" />
)}

{/* Display destination bus marker */}
{busDeparted && !isAnimating && currentBusPosition && (
  <Marker
    position={currentBusPosition}
    label="Bus (Arrived)"
    animation={null}
  />
)}

          
           {origin && driverName && (
          <div
            
            style={{
              position: 'absolute',
              zIndex: 1,
              top: 'calc(50% - 20px)',
              left: 'calc(50% + 20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '0.7rem',
              borderRadius: '5px',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}
          >
            <p>Driver Name: {driverName}</p>
            <p>Number Plate: {numberPlate}</p>
            <p>phoneNo: {PhoneNo}</p>
             <p>Time Remaining: {timeRemaining} seconds</p>
          </div>
        )}
      <div className='map-info'>
      {/* Display distance and duration */}
      {distance && (
        <p>Distance: {distance}</p>
      )}
      {duration && (
        <p>Duration: {duration}</p>
      )}  
    </div>
        </GoogleMap>
        </div>
    </div>
  );
};


