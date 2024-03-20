import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Map } from './Map';
import { GiSteeringWheel } from 'react-icons/gi';
import { useGlobalContext } from './Context';

 


const Sadmin = () => {
  const { totalSeats } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, selectedBus, busId, employee } = location.state || {};
 const { bookedSeats, setBookedSeats, selectedSeats, setSelectedSeats } = useGlobalContext()
  console.log('Total Seats:', totalSeats);
  console.log(amount);
  console.log('busId',busId)
  const { Driver, NoPlate, PhoneNo } = selectedBus || {};

  useEffect(() => {
    // This effect runs when the component mounts
    // Reset selected seats when navigating back to this page
    setSelectedSeats({});

  }, []);
  
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:3000/api/buses/${busId}/fetch_booked_seats`);
        const data = await response.json();
        const fetchedBookedSeats = data.booked_seats || [];
        setBookedSeats((prevBookedSeats) => ({
          ...prevBookedSeats,
          [busId]: fetchedBookedSeats,
        }));
      } catch (error) {
        console.error('Error fetching booked seats:', error);
      }
    };

    fetchBookedSeats();
  }, [busId, setBookedSeats]);

  const handleSeatClick = async (seatNumber) => {
    
    
    const bookedSeatsForSelectedBus = bookedSeats[busId] || [];
  
    if (!bookedSeatsForSelectedBus.includes(seatNumber)) {
      setSelectedSeats((prevSelectedSeats) => {
        const selectedSeatsForBus = prevSelectedSeats[busId] || [];
        const newSelectedSeats = selectedSeatsForBus.includes(seatNumber)
          ? selectedSeatsForBus.filter((seat) => seat !== seatNumber)
          : [...selectedSeatsForBus, seatNumber];
          console.log(`After - selectedSeats (Bus ID ${busId}):`, newSelectedSeats);
          console.log('Booked Seats:', bookedSeats);
        return { ...prevSelectedSeats, [busId]: newSelectedSeats };
      });
    }
    
  };
  
  


  const handleSelectedSeat = () => {
 
    setSelectedSeats([]); 
    }

    const isSeatSelected = (seatNumber) => {
      const selectedSeatsForBus = selectedSeats[busId] || [];
      console.log('selected Seats for Selected Bus:', selectedSeatsForBus);

      return selectedSeatsForBus.includes(seatNumber);
    };
    
    const isSeatBooked = (seatNumber) => {
      // Use the selectedBus ID to get the booked seats for that bus
      const bookedSeatsForSelectedBus = bookedSeats[busId] || [];
      console.log('Selected Bus ID:', busId);
      console.log('Booked Seats for Selected Bus:', bookedSeatsForSelectedBus);
      console.log('Is Seat Booked:', bookedSeatsForSelectedBus.includes(String(seatNumber)));
      return bookedSeatsForSelectedBus.includes(String(seatNumber));
    };
    
    const renderSeats = () => {
      const seats = Array.from({ length: totalSeats }, (_, index) => index + 1);
      console.log('Seats Array:', seats);
      const seatRows = [];
      let currentSeatRow = [];
      let isFirstRow = true;
      let isSecondRow = false;
      let isThirdRow = false;
    
      for (let i = 0; i < seats.length; i++) {
        const seatNumber = seats[i];
        const seatStatus = isSeatSelected(seatNumber)
          ? 'selected'
          : isSeatBooked(seatNumber)
          ? 'booked'
          : 'available';
    
        const isDisabled = isSeatBooked(seatNumber);
    
        if (isFirstRow && currentSeatRow.length === 2) {
          // Add the GiSteeringWheel icon to the first row after the second seat
          currentSeatRow.push(
            <div key={'icon'} className="steering-wheel-icon">
              <GiSteeringWheel />
            </div>
          );
    
          // For the first row, add only two seats
          seatRows.push(
            <div className='seat-row' key={seatRows.length}>
              {currentSeatRow}
            </div>
          );
          currentSeatRow = [];
          isFirstRow = false;
          isSecondRow = true;
        }
    
        if (isSecondRow && currentSeatRow.length === 4) {
          // For the second row, add only 4 seats
          seatRows.push(
            <div className='seat-row' key={seatRows.length}>
              {currentSeatRow}
            </div>
          );
          currentSeatRow = [];
          isSecondRow = false;
          isThirdRow = true;
        }
    
        if (isThirdRow && currentSeatRow.length === 2) {
          // For the third row, add only 2 seats
          seatRows.push(
            <div className='thirdrow' key={seatRows.length}>
              <div className="door-space"></div> {/* Empty space for the door */}
              {currentSeatRow}
            </div>
          );
          currentSeatRow = [];
          isThirdRow = false;
        }
    
        currentSeatRow.push(
          <button
            key={i}
            className={`seat ${seatStatus} ${isSeatBooked(seatNumber) ? 'booked' : ''}`}
            onClick={() => !isDisabled && handleSeatClick(seatNumber)} // Disable click for booked seats
            disabled={isDisabled}
          >
            {seatNumber}
          </button>
        );
    
        if (!isFirstRow && !isSecondRow && !isThirdRow && currentSeatRow.length === 4) {
          // For other rows (after the first, second, and third), add four seats
          seatRows.push(
            <div className='seat-row' key={seatRows.length}>
              {currentSeatRow}
            </div>
          );
          currentSeatRow = [];
        }
      }
    
      // Add any remaining seats (if totalSeats is not divisible by 4)
      if (currentSeatRow.length > 0) {
        if (seatRows.length > 0) {
          // Add remaining seats to the row above the last row
          const lastRowIndex = seatRows.length - 1;
          const lastRowSeats = seatRows[lastRowIndex].props.children.length;
          if (lastRowSeats + currentSeatRow.length <= 5) {
            seatRows[lastRowIndex] = (
              <div className='seat-row' key={lastRowIndex}>
                {seatRows[lastRowIndex].props.children.concat(currentSeatRow)}
              </div>
            );
          } else {
            // If adding remaining seats exceeds 5 seats, add a new row
            seatRows.push(
              <div className='seat-row' key={seatRows.length}>
                {currentSeatRow}
              </div>
            );
          }
        } else {
          // If there are no existing rows, add remaining seats as a new row
          seatRows.push(
            <div className='seat-row' key={seatRows.length}>
              {currentSeatRow}
            </div>
          );
        }
      }
    
      return seatRows;
    };
    
    

  
// const selectedSeatsAmount = selectedSeats.length * parseInt(amount, 10);
const selectedSeatsAmount = Object.values(selectedSeats).reduce((totalAmount, seatsForBus) => {
  // Check if the seat is not booked before adding its amount
  seatsForBus.forEach((seatNumber) => {
    if (!isSeatBooked(seatNumber)) {
      totalAmount += parseInt(amount, 10);
    }
  });
  return totalAmount;
}, 0);
 
// // const selectedSeatsAmount = selectedSeats.length * parseInt(amount, 10);
// const selectedSeatsAmount = selectedSeats.reduce((totalAmount, seatNumber) => {
//   // Check if the seat is not booked before adding its amount
//   if (!isSeatBooked(seatNumber)) {
//     totalAmount += parseInt(amount, 10);
//   }
//   return totalAmount;
// }, 0);



  const handleProceedToPayment = () => {
    // Perform any necessary data validation or checks before navigating to PaymentDetails
    navigate('/payment-details', {
      state: {
        selectedSeats,
        amount: selectedSeatsAmount,
        from: selectedBus?.from,
        to: selectedBus?.to,
        date: selectedBus?.date,
        time: selectedBus?.time,
        driverName: Driver, // Include the driver details here
        driverPhone: PhoneNo,
        driverNoPlate: NoPlate,
        // Add any other relevant data to be passed to PaymentDetails
        busId: busId,
        employee,
      },

    });
    
  };


  return (
    <div className='myseats'>
    
      <h2>Select a Seat</h2>
      <p>Selected Seats: {Object.values(selectedSeats[busId] || []).flat().join(', ')}</p>

<div>{renderSeats()}</div>

{Object.values(selectedSeats[busId] || {}).flat().length > 0 && (
  <p>Amount: {Object.values(selectedSeats[busId] || {}).reduce((totalAmount, seatNumber) => {
    if (!isSeatBooked(seatNumber)) {
      totalAmount += parseInt(amount, 10);
    }
    return totalAmount;
  }, 0)}</p>
)}
            <div
        style={{
          backgroundColor: 'red',
          width: '20px',
          height: '20px',
          display: 'inline-block',
          marginLeft: '1.5rem',
        }}
      ></div>
      <div
        style={{
          backgroundColor: 'green',
          width: '20px',
          height: '20px',
          display: 'inline-block',
          marginLeft: '2.5rem',
        }}
      ></div>
      <div
        style={{
          backgroundColor: 'gray',
          width: '20px',
          height: '20px',
          display: 'inline-block',
          marginLeft: '2.5rem',
         
        }}
      ></div>
      <br></br>
      <p style={{ display: 'inline-block', marginLeft: '5px' }}>Booked</p>
      <p style={{ display: 'inline-block', marginLeft: '5px' }}>Selected</p>
      <p style={{ display: 'inline-block', marginLeft: '5px' }}>Available</p>
      <br></br>

      <button onClick={handleProceedToPayment} disabled={(selectedSeats[busId] || []).length === 0}
>
        Payment Details
      </button>


    </div>
  );
};

export default Sadmin;