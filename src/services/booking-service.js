const axios = require('axios');
const { BookingRepository } = require('../repository/index');
const { ServiceError } = require('../utils/errors/index');
const { FLIGHT_SERVICE_PATH } = require('../config/server-config');

class BookingService {

    constructor(){
        this.bookingRepository = new BookingRepository();
    }

    async createBooking(data){
        try{
            const flightId = data.flightId;
            // communicating with flight service. http://localhost:3000/api/v1/flights/1
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`; //
            const response = await axios.get(getFlightRequestURL);

            const flightData = response.data.data;
            let priceOfTheFlight = flightData.price;

            if(data.totalSeats > flightData.totalSeats){
                throw new ServiceError ('Something went wrong in booking process', 'Insufficient seats available.');
            }
            
            const totalCost = priceOfTheFlight * data.totalSeats;
            const bookingPayload = {...data, totalCost}; // adding total cost in coming data and stroing the result in booking payload

            const booking = await this.bookingRepository.create(bookingPayload);
            
            // after booking is done, we need to update the total seats in flight service. 
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            await axios.patch(updateFlightRequestURL, { totalSeats: flightData.totalSeats - data.totalSeats});

            // change the status to confirmed since booking is successful
            const finalBooking = await this.bookingRepository.update(booking.id, { status: 'Confirmed'});

            return finalBooking;
        }
        catch(error){
            if( error.name == 'RepositoryError' || error.name == 'ValidationError' ){
                throw error;
            }
            throw new ServiceError();
        }
    }
}

module.exports = BookingService;