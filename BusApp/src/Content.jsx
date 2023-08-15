import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Ticket from './Ticket';
import { useGlobalContext } from './Context';
import Outbox from './Outbox';

export const Content = () => {
  const [buses, setBuses] = useState([]);
  const { alert, showAlert, formattedTime, formatTime } = useGlobalContext();
 
  useEffect(() => {
    fetch('https://lets-ride-fe42d9bf40d4.herokuapp.com/api/buses', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setBuses(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const deleteBus = (id) => {
    fetch(`https://lets-ride-fe42d9bf40d4.herokuapp.com/api/buses/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        showAlert(true, 'success', 'Bus deleted successfully!');
        console.log('Bus deleted successfully:', data);
        // Refresh the bus list after deletion
        fetchBuses();
      })
      .catch((error) => {
        console.log('Error deleting bus:', error);
      });
  };

  const fetchBuses = () => {
    fetch('https://lets-ride-fe42d9bf40d4.herokuapp.com/api/buses')
      .then((response) => response.json())
      .then((data) => {
        setBuses(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };



  return (
    <>
      <div>
        {Array.isArray(buses) &&
          buses.map((bus) => (
            <div className="booked">
            <div key={bus.id}>
              {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
              {/* Display bus details */}
              
              <p>{bus.from} to {bus.to}</p>
              <p>Amount: {bus.amount}</p>
              <p>Seats: {bus.seats}</p>
               
               <p>Time: {bus.time ? formatTime(bus.time) : 'N/A'}hrs</p>  {/* Display in HH:mm format */}
              <p>Date: {bus.date}</p>
              <p>Driver Name: {bus.driver_name}</p> {/* Existing field */}
              <p>Number Plate: {bus.number_plate}</p> {/* Existing field */}
              <p>Driver Phone Number: {bus.driver_phone_number}</p> {/* New field */}
              <button onClick={() => deleteBus(bus.id)} >Delete</button>

              <button className="cnt">
                <Link to={`/update/${bus.id}`} className='js'>Edit</Link>
              </button>
           </div>
       
            </div>
            
          ))}
                 <button className="createbs">
        <Link to="/create" className='js'>Create Bus</Link>
      </button>
      </div>
      
    </>
  );
};
