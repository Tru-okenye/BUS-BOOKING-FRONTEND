import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map } from './Map';
import Seats from './Seats';
import { useGlobalContext } from './Context';

const Booked = () => {
  const location = useLocation();
  const { filteredBuses, origin, destination } = location.state || {};
 

  const navigate = useNavigate();

  if (!filteredBuses || filteredBuses.length === 0) {
    return <p>No available buses found.</p>;
  }

  const handleSelectSeat = (bus) => {
    navigate(`/seats/${bus.seats}`, {
      state: {
        selectedBus: {
          from: bus.from,
          to: bus.to,
          date: bus.date,
          time: bus.time,
          Driver: bus.driver_name,
          NoPlate: bus.number_plate,
          PhoneNo: bus.driver_phone_number,
          
        },
        amount: bus.amount,
        busId: bus.id,

      },
    });
  
  };

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };
  
  const parseTime = (timeString, date) => {
    const time = new Date(timeString);
    time.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    return time;
  };
  

  
  

  const currentDate = new Date();
  const currentTime = currentDate.getTime();
  
 console.log('currenttime', currentTime);
 console.log('currentDate', currentDate);
  return (
    <>
      <div className='bg'>
        <div className='booked'>
          <div className='ticketsearch'>
            <h2>Available Buses:</h2>
            {filteredBuses.map((bus) => {
              const departureDate = parseDate(bus.date);
              const departureTime = parseTime(bus.time, departureDate);
             
              console.log('depatureTime', departureTime)
              console.log('depatureDate', departureDate)
              console.log('departureDate > currentDate:', departureDate > currentDate);
              console.log('departureDate === currentDate:', departureDate === currentDate);
              console.log('departureTime.getTime() > currentTime:', departureTime.getTime() > currentTime);


              
              if (
                departureDate > currentDate ||
                (departureDate.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0) &&
                  departureTime.getTime() > currentTime)
              ) {
                return (
                  <div key={bus.id} >
                    <p>ID: {bus.id}</p>
                    <p>From: {bus.from}</p>
                    <p>To: {bus.to}</p>
                    <p>Date: {bus.date}</p>
                    <p>Time: {bus.time ? new Date(bus.time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    }) : 'N/A'}</p>
                    <p>Available Seats: {bus.seats}</p>
                    <p>Price: ksh.{bus.amount}</p>
                    <p>Driver: {bus.driver_name}</p>
                    <p>NoPlate: {bus.number_plate}</p>
                    <button type="button" onClick={() => handleSelectSeat(bus)}>
                      Select Seat
                    </button>
                 
                      </div>
                );
                
             
              } else {
                console.log('Bus does not meet criteria:', bus);
                return null; // Bus doesn't meet the criteria, so don't render anything
              }
            })}
          </div>
        </div>
        {/* {origin && destination && (
                  <Map origin={origin} destination={destination} />
                )} */}
       
      </div>
    </>
  );
};

export default Booked;

