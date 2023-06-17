import Base from "src/models/Base";

class Room extends Base {
    static collectionName = "rooms";

    static indexes = {
        hotetId: {},

    }

    constructor({

            price,
            description,
            capacity,
            hotetId,
            roomType
        }) {

        super(Room.collectionName);
        this.roomType = roomType
        this.price = price
        this.description = description
        this.hotetId = hotetId;
        this.capacity = capacity;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

export default Room