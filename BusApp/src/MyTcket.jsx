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

const MyTcket = ({ paymentDetails }) => {
  const { name, phone, from, to, seats, time, date, amount } = paymentDetails;

  return (
    <>
    
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>TICKET DETAILS</Text>
          <View>
            <Text style={styles.content}>Name: {name}</Text>
            <Text style={styles.content}>Phone: {phone}</Text>
            <Text style={styles.content}>From: {from}</Text>
            <Text style={styles.content}>To: {to}</Text>
            <Text style={styles.content}>Date: {date}</Text>
            <Text style={styles.content}>Time: {time}hrs</Text>
            <Text style={styles.content}>Selected Seat: {seats.join(', ')}</Text>
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
