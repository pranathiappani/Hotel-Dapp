import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import HotelBooking from './contracts/HotelBooking.json';
import Header from './components/Header';
import HotelList from './components/HotelList';
import BookingForm from './components/BookingForm';
import MyBookings from './components/MyBookings';
import AdminPanel from './components/AdminPanel'; // Import the new AdminPanel component
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [web3Error, setWeb3Error] = useState(null);

  // Improved Web3 initialization
  const loadWeb3 = async () => {
    // Modern dapp browsers (MetaMask etc)
    if (window.ethereum) {
      try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Create Web3 instance
        window.web3 = new Web3(window.ethereum);
        
        // Handle chain changes
        window.ethereum.on('chainChanged', (chainId) => {
          window.location.reload();
        });
        
        // Handle account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          setAccount(accounts[0]);
          loadBlockchainData();
        });
        
        return true;
      } catch (error) {
        console.error("User denied account access:", error);
        setWeb3Error("Please connect your MetaMask account to use this DApp");
        return false;
      }
    }
    // Legacy dapp browsers
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      return true;
    }
    // Non-dapp browsers
    else {
      const errorMsg = "Non-Ethereum browser detected. Please install MetaMask!";
      console.error(errorMsg);
      setWeb3Error(errorMsg);
      return false;
    }
  };

  // Robust blockchain data loader
  const loadBlockchainData = async () => {
    console.log("run load bloackchain fun ");
    setLoading(true);
    setWeb3Error(null);
    
    try {
      // First ensure web3 is properly initialized
      const isWeb3Ready = await loadWeb3();
      if (!isWeb3Ready || !window.web3) {
        throw new Error("Web3 provider not available");
      }

      // Get accounts
      const accounts = await window.web3.eth.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }
      setAccount(accounts[0]);

      // Get network ID
      const networkId = await window.web3.eth.net.getId();
      
      // Get deployed network data
      const deployedNetwork = HotelBooking.networks[networkId];
      if (!deployedNetwork) {
        throw new Error(`Contract not deployed on network ${networkId}`);
      }

      // Create contract instance
      const contractInstance = new window.web3.eth.Contract(
        HotelBooking.abi,
        deployedNetwork.address
      );
      setContract(contractInstance);

      // Load hotels
      const hotelCount = await contractInstance.methods.hotelCounter().call();
      const loadedHotels = [];
      for (let i = 1; i <= hotelCount; i++) {
        const hotel = await contractInstance.methods.hotels(i).call();
        loadedHotels.push(hotel);
      }
      setHotels(loadedHotels);

      // Load user bookings
      const userBookings = await contractInstance.methods.getUserBookings().call({ from: accounts[0] });
      setBookings(userBookings);
      
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      setWeb3Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const bookRoom = async (hotelId, checkInDate, checkOutDate, price) => {
    try {
      setLoading(true);
      const nights = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
      const totalAmount = price * nights;

      await contract.methods.bookRoom(
        hotelId,
        Math.floor(new Date(checkInDate).getTime() / 1000),
        Math.floor(new Date(checkOutDate).getTime() / 1000)
      ).send({ from: account, value: totalAmount.toString() });

      await loadBlockchainData();
      setSelectedHotel(null);
    } catch (error) {
      console.error("Booking failed:", error);
      setWeb3Error("Booking failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      await contract.methods.cancelBooking(bookingId).send({ from: account });
      await loadBlockchainData();
    } catch (error) {
      console.error("Cancellation failed:", error);
      setWeb3Error("Cancellation failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div className="App">
      <Header account={account} />
      
      {/* Web3 Error Message */}
      {web3Error && (
        <div className="web3-error">
          <p>{web3Error}</p>
          {!window.ethereum && (
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="metamask-link"
            >
              Install MetaMask
            </a>
          )}
          <button 
            onClick={loadBlockchainData}
            className="retry-btn"
          >
            Retry Connection
          </button>
        </div>
        
      )}

      {/* Admin Panel - Only visible to contract owner */}
      {!loading && !web3Error && (
        <AdminPanel contract={contract} account={account} />
      )}

      <div className="container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading blockchain data...</p>
          </div>
        ) : (
          <div className="app-content">
            <div className="hotel-section">
              <h2>Available Hotels</h2>
              <HotelList 
                hotels={hotels} 
                onSelectHotel={setSelectedHotel}
              />
            </div>
            <div className="booking-section">
              <MyBookings 
                bookings={bookings} 
                onCancelBooking={cancelBooking} 
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Booking Modal */}
      {selectedHotel && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="close-btn" 
              onClick={() => setSelectedHotel(null)}
            >
              &times;
            </button>
            <BookingForm 
              hotel={selectedHotel}
              onBookRoom={bookRoom}
              onClose={() => setSelectedHotel(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;