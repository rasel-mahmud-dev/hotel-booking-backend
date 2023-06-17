import Base from "src/models/Base";

class Booking extends Base {
    static collectionName = "";

    static indexes = {
        userId: {},
        hotelId: {},
        roomId: {},
    }

    constructor({
                    userId,
                    hotelId,
                    roomId,
                    checkInDate,
                    checkOutDate,
                    totalPrice,
                    status,
                }) {

        super(Booking.collectionName);

        this.userId = userId
        this.hotelId = hotelId
        this.roomId = roomId
        this.checkInDate = checkInDate
        this.checkOutDate = checkOutDate
        this.totalPrice = totalPrice
        this.status = status
        this.createdAt = new Date();
        this.updatedAt = new Date()
    }
}

export default Booking