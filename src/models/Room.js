import Base from "src/models/Base";

class Room extends Base {
    static collectionName = "rooms";

    static indexes = {
        hotetId: {},
        roomName: {},
    }

    constructor({
            description,
            image,
            roomName,
            hotelId,
            roomType,
            capacity,
            price,
        }) {

        super(Room.collectionName);
        this.roomName = roomName
        this.description = description
        this.image = image
        this.hotelId = hotelId
        this.roomType = roomType
        this.capacity = capacity
        this.price = price
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

export default Room