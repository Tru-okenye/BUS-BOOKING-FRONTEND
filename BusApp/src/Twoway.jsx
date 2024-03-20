import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map } from './Map';
import Seats from './Seats';
import { useGlobalContext } from './Context';
import TwowaySeats from './Twowayseats';

const Twoway = ({busId}) => {
  const location = useLocation();
  const { outgoingBuses, returningBuses, origin, destination } = location.state || {};
  const navigate = useNavigate();
  const [showSeatsMap, setShowSeatsMap] = useState({});
  const { bookedSeats, setBookedSeats, selectedSeats, setSelectedSeats} = useGlobalContext()

  const handleSelectSeat = (bus) => {
    // Set the selected bus and toggle the showSeats state
    setShowSeatsMap((prev) => ({ ...prev, [bus.id]: !prev[bus.id], seats: bus.seats }));
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

   


  const isSeatBooked = (seatNumber) => {
    // Use the selectedBus ID to get the booked seats for that bus
    const bookedSeatsForSelectedBus = bookedSeats[busId] || [];
    console.log('Selected Bus ID:', busId);
    console.log('Booked Seats for Selected Bus:', bookedSeatsForSelectedBus);
    console.log('Is Seat Booked:', bookedSeatsForSelectedBus.includes(String(seatNumber)));
    return bookedSeatsForSelectedBus.includes(String(seatNumber));
  };
  

  
  const handleProceedToPayment = () => {
    // Perform any necessary data validation or checks before navigating to PaymentDetails
    const totalAmount = calculateTotalAmount();
    navigate('/payment-details', {
      state: {
        selectedSeats,
        amount: totalAmount,
        from: from,
        to: to,
        date: date,
        time: time,
        driverName: Driver, // Include the driver details here
        driverPhone: PhoneNo,
        driverNoPlate: NoPlate,
        // Add any other relevant data to be passed to PaymentDetails
        
      },
    });
  };

 
  const calculateTotalAmount = () => {
    console.log('Calculating total amount...');
    let totalAmount = 0;
  
    // Calculate total amount for outgoing bus
    totalAmount += Object.values(selectedSeats).reduce((acc, seatsForBus) => {
      acc += seatsForBus.reduce((subAcc, seatNumber) => {
        // Get the busId from the selectedSeats object
        const busId = Object.keys(selectedSeats).find((key) => selectedSeats[key] === seatsForBus);
        console.log('busId:', busId);
        
        // Get the bus object from the outgoingBuses or returningBuses array
        const bus = [...outgoingBuses, ...returningBuses].find((bus) => {
          console.log('bus in find:', bus);
          return bus.id === busId;
        });
        console.log('busamount', bus);
        
        if ( !isSeatBooked(seatNumber)) {
          // Use the bus object to get the amount
          subAcc += parseInt(bus.amount, 10);
        }
        return subAcc;
      }, 0);
      return acc;
    }, 0);
  
    return totalAmount;
  };
  
  

  return (
    <>
      <div className='bg'>
        <div className='booked'>
          <div>
            <h2>Available Buses (Outgoing):</h2>
            {[...outgoingBuses, ...returningBuses].map((bus) => {
              const isOutgoing = outgoingBuses.some((outgoingBus) => outgoingBus.id === bus.id);
              const departureDate = parseDate(bus.date);
              const departureTime = parseTime(bus.time, departureDate);
              const isFutureDeparture =
                departureDate > currentDate ||
                (departureDate.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0) &&
                  departureTime.getTime() > currentTime);

                  const amount = bus.amount
                  
              if (isFutureDeparture) {
                return (
                  <div key={bus.id} className=''>
                    <p>{bus.id}</p>
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
                    {showSeatsMap[bus.id] && bus.seats && (
                      <TwowaySeats
                        amount={amount}
                        from={bus.from}
                        to={bus.to}
                        date={bus.date}
                        time={bus.time}
                        Driver={bus.driver_name}
                        NoPlate={bus.number_plate}
                        PhoneNo={bus.driver_phone_number}
                        busId={bus.id}
                        totalSeats={bus.seats}
                        isOutgoing={isOutgoing}
                        isSeatBooked={isSeatBooked}
                       
                      />
                    )}
                  </div>
                );
              }
              return null; // Bus doesn't meet the criteria, so don't render anything
            })}
                 {calculateTotalAmount() > 0 && <p>Total Amount: {calculateTotalAmount()}</p>}
      <button onClick={handleProceedToPayment} disabled={(selectedSeats[busId] || []).length === 0}
>
        Payment Details
      </button>
          </div>
        </div>
      </div>

 
      {origin && destination && (
        <Map origin={origin} destination={destination} />
      )}

    </>
  );
};

export default Twoway;
