import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Map } from './Map';
import { GiSteeringWheel } from 'react-icons/gi';
import { useGlobalContext } from './Context';
import Twoway from './Twoway';

 


const TwowaySeats = ({Driver, NoPlate, PhoneNo, amount, busId, date, from, to, time, isSeatBooked, totalSeats, handleProceedToPayment}) => {
//   const { totalSeats } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
 const { bookedSeats, setBookedSeats, selectedSeats, setSelectedSeats} = useGlobalContext()
  console.log('Total Seats:', totalSeats);
  console.log(amount);
  console.log('busId',busId)
 

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
      console.log('selected Seats for Selected Busid:', busId);

      return selectedSeatsForBus.includes(seatNumber);
    };

  

  const renderSeats = () => {
    const seats = Array.from({ length: totalSeats }, (_, index) => index + 1);
    console.log('Seats Array:', seats);
    const seatRows = [];
    let currentSeatRow = [];
    let isFirstRow = true;
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
        isThirdRow = true;
      }
     
      if (isThirdRow && currentSeatRow.length === 2) {
        // For the third row, add only two seats
        seatRows.push(
          <div className='seat-row' key={seatRows.length}>
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

      if (!isFirstRow && !isThirdRow && currentSeatRow.length === 4) {
        // For other rows (after the first and third), add four seats
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
      seatRows.push(
        <div className='seat-row' key={seatRows.length}>
          {currentSeatRow}
        </div>
      );
    }

    return seatRows;
  };

  


  return (
    <>
    <div className='myseats'>
      <h2>Select a Seat</h2>
      <p>Selected Seats: {Object.values(selectedSeats[busId] || []).flat().join(', ')}</p>

<div>{renderSeats()}</div>

</div>
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

   
    <div>


    </div>
    
    </>
  );
};

export default TwowaySeats;