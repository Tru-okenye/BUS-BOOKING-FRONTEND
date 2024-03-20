import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Booked from './Booked';
import { Map } from './Map';
import { useGlobalContext } from './Context';
import { useJsApiLoader } from '@react-google-maps/api';
import Outbox from './Outbox';
import {  Link } from 'react-router-dom';


const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi',
  'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Lamu', 'Machakos', 'Naivasha', 'Bungoma',
  // Add more counties as needed
];
const libraries = ["places", "geocoding", "geometry"];
const Tofro = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [availableBuses, setAvailableBuses] = useState([]);
  const navigate = useNavigate();
  const { alert, showAlert } = useGlobalContext();

   const { isLoaded, loadError } = useJsApiLoader({
     googleMapsApiKey: "AIzaSyCivwKyWPJekwIy1H7y4EHkmE3FgC005Ng",
    libraries: libraries,
  });

  if (!isLoaded) {
  return <div>Loading...</div>;
}
  if (loadError) {
    return <div>Error loading Google Maps API</div>;
  }

  const handlePlaceChange = (value, field) => {
    if (field === 'from') {
      setFrom(value);
    } else if (field === 'to') {
      setTo(value);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!from || !to || !departureDate) {
      console.log('Please provide the source, destination, and departure date.');
      return;
    }

    try {
      // Make API request for buses from source to destination
      const response1 = await fetch(`http://127.0.0.1:3000/api/buses?from=${from}&to=${to}&date=${departureDate}`);
      const data1 = await response1.json();

      // Make API request for buses from destination back to source
      const response2 = await fetch(`http://127.0.0.1:3000/api/buses?from=${to}&to=${from}&date=${returnDate}`);
      const data2 = await response2.json();

      if (data1.length > 0 && data2.length > 0) {
        const combinedBuses = [...data1, ...data2];
        setAvailableBuses(combinedBuses);

        navigate('/twoway', {
          state: {
            outgoingBuses: data1,
            returningBuses: data2,
            origin: from,
            destination: to,
            departureDate,
            returnDate,
          },
        });
      } else {
        showAlert(true, 'danger', "We don't currently serve those routes.");
      }
    } catch (error) {
      console.log('Error checking for available buses:', error);
    }
  };
  

  return (
    <>
      <div className='bg'>
        <div className='booking'>
          <div>
            <h2>Booking</h2>
        

            <form onSubmit={handleSubmit}>
              {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
              <label htmlFor="from">
                From:
                <input
                  type="text"
                  id="from"
                  name="from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="e.g Nairobi"
                  list="fromList"
                />
                <datalist id="fromList">
                  {kenyanCounties.map((county, index) => (
                    <option key={index} value={county} />
                  ))}
                </datalist>
              </label>
              <br />

              <label htmlFor="to">
                To:
                <input
                  type="text"
                  id="to"
                  name="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter destination"
                  list="toList"
                />
                <datalist id="toList">
                  {kenyanCounties.map((county, index) => (
                    <option key={index} value={county} />
                  ))}
                </datalist>
              </label>
              <br />

              <label htmlFor="date">
                Depature Date:
                <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                />
              </label>
              <br />
              <label htmlFor="date">
                Return Date:
                <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                />
              </label>
              <br />

              <button type="submit">Search Buses</button>
            </form>
          </div>
        </div>
        <Map />
        <Booked />
      </div>
    </>
  );
};

export default Tofro;







