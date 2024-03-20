// History.jsx

import React, { useState, useEffect } from 'react';

const BusHistory = () => {
  const [arrivedBuses, setArrivedBuses] = useState([]);

  useEffect(() => {
    fetchArrivedBuses();
  }, []);

  const fetchArrivedBuses = () => {
    // Fetch the details of arrived buses from the backend
    fetch('http://localhost:3000/api/buses/arrived_buses')
      .then((response) => response.json())
      .then((data) => {
        setArrivedBuses(data);
      })
      .catch((error) => {
        console.error('Error fetching arrived buses:', error);
      });
  };

  return (
    <div>
      <h2>Arrived Buses</h2>
      <ul>
        {arrivedBuses.map((bus) => (
          <li key={bus.id}>
            <p>From: {bus.from}</p>
            <p>To: {bus.to}</p>
            <p>Seats: {bus.seats}</p>
            {/* Display other details of the bus */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusHistory;
