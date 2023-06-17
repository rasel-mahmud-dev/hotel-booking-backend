import Base from "./Base";
import {ObjectId} from "mongodb";

class Hotel extends Base {
    static collectionName = "hotels";

    static indexes = {
        ownerId: {},

    }

    constructor({


                    description,
                    address = {},
                    ownerId,
                    image,
                    name
                }) {
        super(Hotel.collectionName);
        this.name = name
        this.image = image
        this.description = description
        this.ownerId = ownerId;
        this.address = address;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}



export default Hotel;
