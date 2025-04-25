// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HotelBooking {
    address public owner;
    
    struct Hotel {
        uint id;
        string name;
        string location;
        uint totalRooms;
        uint availableRooms;
        uint pricePerNight;
        address hotelOwner;
    }
    
    struct Booking {
        uint id;
        uint hotelId;
        address guest;
        uint checkInDate;
        uint checkOutDate;
        uint totalAmount;
        bool isCancelled;
    }
    
    uint public hotelCounter;
    uint public bookingCounter;
    
    mapping(uint => Hotel) public hotels;
    mapping(uint => Booking) public bookings;
    mapping(address => uint[]) public userBookings;
    
    event HotelAdded(uint id, string name, string location, uint pricePerNight);
    event RoomBooked(uint bookingId, uint hotelId, address guest, uint amount);
    event BookingCancelled(uint bookingId);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function addHotel(string memory _name, string memory _location, uint _totalRooms, uint _pricePerNight) public onlyOwner {
        hotelCounter++;
        hotels[hotelCounter] = Hotel(
            hotelCounter,
            _name,
            _location,
            _totalRooms,
            _totalRooms,
            _pricePerNight,
            msg.sender
        );
        emit HotelAdded(hotelCounter, _name, _location, _pricePerNight);
    }
    
    function bookRoom(uint _hotelId, uint _checkInDate, uint _checkOutDate) public payable {
        Hotel storage hotel = hotels[_hotelId];
        require(hotel.availableRooms > 0, "No rooms available");
        require(msg.value == hotel.pricePerNight, "Incorrect payment amount");
        
        uint nights = _checkOutDate - _checkInDate;
        uint totalAmount = hotel.pricePerNight * nights;
        
        bookingCounter++;
        bookings[bookingCounter] = Booking(
            bookingCounter,
            _hotelId,
            msg.sender,
            _checkInDate,
            _checkOutDate,
            totalAmount,
            false
        );
        
        userBookings[msg.sender].push(bookingCounter);
        hotel.availableRooms--;
        payable(hotel.hotelOwner).transfer(totalAmount);
        
        emit RoomBooked(bookingCounter, _hotelId, msg.sender, totalAmount);
    }
    
    function cancelBooking(uint _bookingId) public {
        Booking storage booking = bookings[_bookingId];
        require(booking.guest == msg.sender, "Only booking guest can cancel");
        require(!booking.isCancelled, "Booking already cancelled");
        
        Hotel storage hotel = hotels[booking.hotelId];
        booking.isCancelled = true;
        hotel.availableRooms++;
        payable(msg.sender).transfer(booking.totalAmount);
        
        emit BookingCancelled(_bookingId);
    }
    
    function getHotels() public view returns (Hotel[] memory) {
        Hotel[] memory hotelList = new Hotel[](hotelCounter);
        for (uint i = 1; i <= hotelCounter; i++) {
            hotelList[i-1] = hotels[i];
        }
        return hotelList;
    }
    
    function getUserBookings() public view returns (Booking[] memory) {
        uint[] storage userBookingIds = userBookings[msg.sender];
        Booking[] memory userBookingList = new Booking[](userBookingIds.length);
        for (uint i = 0; i < userBookingIds.length; i++) {
            userBookingList[i] = bookings[userBookingIds[i]];
        }
        return userBookingList;
    }
}