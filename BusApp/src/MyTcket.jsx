import React from 'react';
import { Page, Document, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    
   backgroundColor: 'gray',
    
    display: 'grid',          
    justifyItems: 'center', 
   
  },
  section: {
    margin: 5,
    padding: 5,
    backgroundColor: 'white',
    
    borderRadius: 3,

  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
     backgroundColor: 'blue',
  },
   footer: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
     backgroundColor: 'blue',
  },
  content: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    
  },
});

const MyTcket = ({ paymentDetails, ticketNumber, employee }) => {
  const { name, phone, from, to, seats, time, date, amount  } = paymentDetails;
  const bookedSeats = Array.isArray(seats)
  ? seats
  :  Object.values(seats).flat();
  return (
    <>
    
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>TICKET DETAILS</Text>
          <View>
            <Text style={styles.content}>TicketNo: {ticketNumber}</Text>
            <Text style={styles.content}>Name: {name}</Text>
            <Text style={styles.content}>Phone: {phone}</Text>
            <Text style={styles.content}>From: {from}</Text>
            <Text style={styles.content}>To: {to}</Text>
            <Text style={styles.content}>Date: {date}</Text>
            <Text style={styles.content}>Time: {time ? new Date(time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }) : 'N/A'}</Text>
            <Text style={styles.content}>Booked Seat: {bookedSeats.join('')}</Text>
            <Text style={styles.content}>Payment method: : MPESA</Text>
            <Text style={styles.content}>{employee && `Booked by: ${employee}`}</Text>

          
            {/* <p>Booked Seats: {Object.values(Seats).flat().join(', ')}</p> */}
            <Text style={styles.content}>Total Amount Paid: Ksh {amount}</Text>
            <Text style={styles.footer}>Enjoy your ride !</Text>
          </View>
        </View>
      </Page>
    </Document>
    </>

    
  );
};

export default MyTcket;
