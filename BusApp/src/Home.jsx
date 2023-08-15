import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
    <nav>
    <ul>
      <li>
<Link to="/" className='link'>MYBUS</Link>
</li>
</ul>
    </nav>
    
  
    <Outlet/>
    </>
  );
};

export default Home;
