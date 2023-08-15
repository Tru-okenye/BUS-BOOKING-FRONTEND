import React from 'react';
import Employee from './Employee';
import {  Link } from 'react-router-dom';
const Bus = () => {
  return (
    <>
    
    <div className='Home'>
  <div className='routes'>
      <h2>Proceed to booking <br></br> and ride with us </h2>
      <div className='mybtn'>

      <button className='btn'>
      <Link to='/booking' className='js'>BOOKING</Link> 
      </button>
      </div>

      <div>
        <h3>Our main Routes:</h3>
        <ul>
          <li>Nairobi-Nakuru</li>
          <li>Nairobi-Nyeri </li>
          <li>Nakuru-Nairobi</li>
          <li>Nyeri-Nairobi</li>
          </ul>
      </div>

  </div>
    
<div className="employee">

      <Employee/>
</div>

    </div>
    </>
  )
}

export default Bus;