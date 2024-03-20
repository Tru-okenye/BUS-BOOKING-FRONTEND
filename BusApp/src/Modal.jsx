import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './App.css';
import { useGlobalContext } from './Context';

const Modal = () => {
  const { showModal, closeModal, handleCancelTicket, error, successMessage } = useGlobalContext();

  return (
    <section>
      <div className={`${showModal ? 'modal' : 'display'}`}>
        <button className="icon" onClick={closeModal}>
          <FaTimes />
        </button>
        <h4>Are you sure you want to cancel your ticket?</h4>
        <div className='modalbtn'>

        <button onClick={handleCancelTicket} className='cancel'>Yes</button>
        <button onClick={closeModal} className='cancel'>No</button>
        </div>
      </div>
     
    </section>
  );
};

export default Modal;
