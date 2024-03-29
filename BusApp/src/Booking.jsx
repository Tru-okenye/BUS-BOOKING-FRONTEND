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
const Booking = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!from || !to || !date) {
      console.log('Please provide the source, destination, and date.');
      return;
    }

    // Make an API request to check for available buses
    fetch(`http://127.0.0.1:3000/api/buses?from=${from}&to=${to}&date=${date}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setAvailableBuses(data);
          navigate('/booked', {
            state: {
              filteredBuses: data,
              origin: from,
              destination: to,
            },
          });
        } else {
          showAlert(true, 'danger', 'Oh no! We don\'t go there at the moment!');
          console.log("We don't currently serve those routes.");
        }
      })
      .catch((error) => {
        console.log('Error checking for available buses:', error);
      });
  };

  return (
    <>
      <div className='bg'>
        <div className='booking'>
          <div>
            <h2>Booking</h2>
            {/* <button className='btn'>
              <Link to='/roundtrip' className='js'>ROUNDTRIP</Link> 
            </button> */}
  
            <form onSubmit={handleSubmit}>
              {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
              <label htmlFor="from">
                From:
                <select
                  id="from"
                  name="from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                >
                  <option value="">Select origin</option>
                  {kenyanCounties.map((county, index) => (
                    <option key={index} value={county}>{county}</option>
                  ))}
                </select>
              </label>
              <br />
  
              <label htmlFor="to">
                To:
                <select
                  id="to"
                  name="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                >
                  <option value="">Select destination</option>
                  {kenyanCounties.map((county, index) => (
                    <option key={index} value={county}>{county}</option>
                  ))}
                </select>
              </label>
              <br />
  
              <label htmlFor="date">
                Date:
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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

export default Booking;







