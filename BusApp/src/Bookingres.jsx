import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const Bookingres = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [availableBuses, setAvailableBuses] = useState([]);
  const navigate = useNavigate();
  const { alert, showAlert } = useGlobalContext();
  const [ticketDetails, setTicketDetails] = useState(null); 
  const location = useLocation();
  const { ticketNumber } = location.state || {};
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCivwKyWPJekwIy1H7y4EHkmE3FgC005Ng",
   libraries: libraries,
 });

//   if (!isLoaded) {
//   return <div>Loading...</div>;
// }
//   if (loadError) {
//     return <div>Error loading Google Maps API</div>;
//   }

  useEffect(() => {
    if (ticketNumber) {
      // Fetch ticket details using the ticket number
      const fetchTicketDetails = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}`);
          if (response.ok) {
            const responseData = await response.json();
            const ticketDetails = responseData.data; // Access the data object
            const { from, to, date } = ticketDetails; // Extract relevant ticket details
            setFrom(from);
            setTo(to);
            setDate(date);
            setTicketDetails(ticketDetails); 
          } else {
            showAlert(true, 'danger', 'Ticket not found');
          }
        } catch (error) {
          console.error('Error fetching ticket details:', error);
          showAlert(true, 'danger', 'Error fetching ticket details');
        }
      };
      fetchTicketDetails();
    }
  }, [ticketNumber, showAlert]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'from') {
      setFrom(value);
    } else if (name === 'to') {
      setTo(value);
    } else if (name === 'date') {
      setDate(value);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!from || !to || !date) {
      console.log('Please provide the source, destination, and date.');
      return;
    }
  
    try {
      // Check if there are buses traveling on the selected date
      const busResponse = await fetch(`http://127.0.0.1:3000/api/buses?from=${from}&to=${to}&date=${date}`);
      if (busResponse.ok) {
        const busData = await busResponse.json();
        if (busData.length === 0) {
          showAlert(true, 'danger', 'There are no buses traveling on the selected date.');
          return;
        }
      } else {
        console.error('Failed to check for available buses.');
        showAlert(true, 'danger', 'Failed to check for available buses.');
        return;
      }
  
      // Proceed with updating the ticket
      const response = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, date }), // Send the edited values in the request body
      });
  
      if (response.ok) {
        // Proceed with searching for available buses
        const data = await response.json();
        const ticketDetailsData = ticketDetails;
        // Fetch available buses using the updated input values
        fetch(`http://127.0.0.1:3000/api/buses?from=${from}&to=${to}&date=${date}`)
          .then((response) => response.json())
          .then((busData) => {
            if (busData.length > 0) {
              setAvailableBuses(busData);
              navigate('/bookedres', {
                state: {
                  filteredBuses: busData,
                  origin: from,
                  destination: to,
                  ticketNumber: ticketNumber,
                  updatedTicketDetails: data,
                  Bookedseat: ticketDetailsData.seats,
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
      } else {
        showAlert(true, 'danger', 'Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      showAlert(true, 'danger', 'Error updating ticket');
    }
  };
  

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  if (loadError) {
    return <div>Error loading Google Maps API</div>;
  }
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
              {/* Input fields pre-filled with ticket details */}
              {alert.show && <Outbox {...alert} removeAlert={showAlert} />}

              <label htmlFor="from">
                From:
                <select
                  id="from"
                  name="from"
                  value={from}
                  onChange={handleInputChange}
                >
                  <option value="">Select origin</option>
                  {kenyanCounties.map((county, index) => (
                    <option key={index} value={county} disabled>{county} </option>
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
                  onChange={handleInputChange}
                >
                  <option value="">Select destination</option>
                  {kenyanCounties.map((county, index) => (
                    <option key={index} value={county} disabled>{county}</option>
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
                  onChange={handleInputChange}
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

export default Bookingres;





