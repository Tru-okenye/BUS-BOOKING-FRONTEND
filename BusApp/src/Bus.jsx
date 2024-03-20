import React from 'react';
import Employee from './Employee';
import {  Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import HomeSidebar from './Homesidebar';
import { useGlobalContext } from './Context';
const Bus = () => {
  const { alert, showAlert, openSidebar, openModal, showSidebar } = useGlobalContext();

  return (
    <>
       <div>
        {showSidebar ? null : (
          <div>
            <button className="sidebar-toggle" onClick={openSidebar}>
              <FaBars />
            </button>
          </div>
        )}
        <HomeSidebar/>
      </div>
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