import Base from "./Base";

import User from "./User"
import Hotel from "./Hotel"
import Room from "./Room"
import Booking from "./Booking"


function indexesCollections(){
    Base.initialMongodbIndexes([
        User,
        Hotel,
        Room,
        Booking,
    ])
}
export default indexesCollections