import React, { useState } from 'react';
import { useGlobalContext } from './Context';
import { useNavigate } from 'react-router-dom';
import Outbox from './Outbox';

const Employee = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
const { alert, showAlert } = useGlobalContext();

const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://lets-ride-fe42d9bf40d4.herokuapp.com/api/employees/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employee_id: employeeId, employee_number: employeeNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, redirect to the content page with buses
        // You can use the history object or a routing library like React Router for redirection
        showAlert(true, 'success', 'Logged in successfully!');

        navigate('/content')
        console.log('Logged in successfully!', data.employee);
      } else {
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Login failed. Please try again later.');
    }
  };

  return (
    <div className='emp'>
      <h3>Employee login only</h3>
      <form onSubmit={handleLogin}>
        <div>
        {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
          <label htmlFor="employeeId">Employee ID:</label>
          <input
            type="text"
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>
        <div className='below'>
          <label htmlFor="employeeNumber">Employee No:</label>
          <input
            type="text"
            id="employeeNumber"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
          />
        </div>
        <button type="submit" className='button'>SIGN IN</button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default Employee;
