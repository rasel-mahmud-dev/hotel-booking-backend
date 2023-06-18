import formidable from "formidable";
import imageKitUpload from "src/services/ImageKitUpload";
import Hotel from "src/models/Hotel";
import {ObjectId} from "mongodb";
import Room from "src/models/Room";
import Booking from "src/models/Booking";


export const getRooms = async (req, res, next) => {
    try {
        const {type} = req.query


        let filter = {}
        if (type && type === "owner") {
            if (req.user.role !== "ADMIN") {
                filter["owner._id"] = new ObjectId(req.user._id)
            }
        }

        let rooms = await Room.aggregate([
            {
                $lookup: {
                    from: "hotels",
                    localField: "hotelId",
                    foreignField: "_id",
                    as: "hotel"
                }
            },
            {
                $unwind: {path: "$hotel"}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "hotel.ownerId",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: {path: "$owner"}
            },
            {
                $match: filter
            },
            {
                $project: {
                    _id: 1,
                    roomName: 1,
                    hotelId: 1,
                    roomNo: 1,
                    image: 1,
                    description: 1,
                    price: 1,
                    roomType: 1,
                    capacity: 1,
                    hotel: {
                        name: 1,
                        address: 1,
                        image: 1
                    },
                    owner: {
                        fullName: 1,
                        avatar: 1
                    }
                }
            }
        ])


        res.status(200).json({rooms: rooms});

    } catch (ex) {

    }

}

export const getRoom = async (req, res, next) => {
    try {
        const {type, roomId} = req.query
        let filter = {}
        if (roomId) {
            filter["_id"] = new ObjectId(roomId)
        }
        let room = await Room.findOne(filter)
        res.status(200).json({room: room});

    } catch (ex) {

    }

}

export const createRoom = (req, res, next) => {

    // parse a file upload
    const form = formidable({multiples: false});

    form.parse(req, async (err, fields, files) => {

        if (err) return next("Can't read form data");
        try {
            let {
                roomName,
                roomNo,
                hotelId,
                roomType,
                description,
                capacity = 1,
                image = "",
                price,
                _id,
            } = fields;


            let imageUrl = "";

            // check this hotel is created current logged user or not
            if (!hotelId) {
                return next("Please select your hotel")
            }

            let hotel = await Hotel.findOne({
                _id: new ObjectId(hotelId),
                ownerId: new ObjectId(req.user._id)
            })
            if (!hotel) {
                return next("Please select your created hotel")
            }

            if (files && files.image) {
                let fileName = files.image.newFilename + "-" + files.image.originalFilename
                let uploadInfo = await imageKitUpload(files.image.filepath, fileName, "hotel-booking")
                if (uploadInfo) {
                    imageUrl = uploadInfo.url
                }
            }

            capacity = Number(capacity)
            if (isNaN(capacity)) {
                capacity = 1
            }

            let newRoomData = {
                description,
                image: imageUrl ? imageUrl : image,
                roomNo,
                roomName,
                hotelId: new ObjectId(hotelId),
                roomType,
                capacity,
                price,
                createdAt: new Date()
            }
            let result = await Room.updateOne({
                _id: _id ? new ObjectId(_id) : new ObjectId()
            }, {
                $set: newRoomData
            }, {
                upsert: true
            })

            res.status(201).json({room: ""});

        } catch (ex) {
            next(ex);
        }
    });
};


export const filterRooms = async (req, res, next) => {
    try {

        let {
            search,
            checkInDate = new Date(),
            checkOutDate,
            roomType,
            capacity,
            city,
        } = req.body

        checkInDate = new Date(checkInDate)
        checkOutDate = new Date(checkOutDate)

        let filter = []

        if (roomType) {
            filter.push({roomType})
        }
        capacity = Number(capacity)
        if (!isNaN(capacity) && capacity > 0) {
            filter.push({capacity})
        }
        if (city) {
            filter.push({"hotel.address.city": city})
        }

        let rooms = await Room.aggregate([
            {
                $lookup: {
                    from: "booking",
                    let: {roomId: "$_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$roomId", "$$roomId"]},
                                        {
                                            $and: [
                                                {$lte: ["$checkInDate", checkInDate]},
                                                {$gte: ["$checkOutDate", checkOutDate]}
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "bookings"
                }
            },
            {
                $match: {
                    bookings: {$size: 0},
                }
            },
            {
                $lookup: {
                    from: "hotels",
                    localField: "hotelId",
                    foreignField: "_id",
                    as: "hotel"
                }
            },
            {
                $unwind: {path: "$hotel"}
            },
            /*** match by room name or hoter name */
            {
                $match: {
                    $or: [
                        {roomName: new RegExp(search, 'i')},
                        {"hotel.name": new RegExp(search, 'i')}
                    ],
                    $and: filter.length > 0 ? filter : [{}]

                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "hotel.ownerId",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: {path: "$owner"}
            },
            {
                $project: {
                    _id: 1,
                    roomName: 1,
                    hotelId: 1,
                    roomNo: 1,
                    image: 1,
                    description: 1,
                    price: 1,
                    roomType: 1,
                    capacity: 1,
                    hotel: {
                        name: 1,
                        address: 1,
                        image: 1
                    },
                    owner: {
                        fullName: 1,
                        avatar: 1
                    }
                }
            }
        ])

        res.status(200).json({rooms: rooms});

    } catch (ex) {
        console.log(ex)
        next(ex)
    }
}


export const reserveRoom = async (req, res, next) => {
    try {
        let {
            roomId,
            hotelId,
            checkInDate,
            checkOutDate,
            totalPrice = 0,
            status = "pending"
        } = req.body

        if (!(roomId && hotelId)) {
            return next("Please provide room id and hotel id")
        }

        checkInDate = new Date(checkInDate)
        checkOutDate = new Date(checkOutDate)


        if (checkOutDate < checkInDate) {
            return next("Check Out Date should be greater than check in date")
        }

        /*** compare check in check out date before booking room */
        let booked = await Booking.find({
            roomId: new ObjectId(roomId),
            hotelId: new ObjectId(hotelId),
            $and: [
                {
                    checkOutDate: {
                        $lte: checkOutDate,
                    },

                },
                {
                    checkInDate: {
                        $gte: checkInDate,
                    },
                }
            ]
        })

        if (booked && booked.length > 0) {
            return next("Sorry, This room already booked..")
        }


        let newBooking = new Booking({
            roomId: new ObjectId(roomId),
            userId: new ObjectId(req.user._id),
            hotelId: new ObjectId(hotelId),
            checkInDate,
            checkOutDate,
            totalPrice,
            status: "confirmed" // it should be confirmed by admin
        })
        newBooking = await newBooking.save()
        res.status(201).json({reserve: newBooking});

    } catch (ex) {
        next(ex)
    }
}

export const getBookedRooms = async (req, res, next) => {
    try {


        let pipeline = []
        if (req.user.role === "ADMIN") {

            pipeline.push({
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "author"
                }
            })
            pipeline.push({
                $unwind: {path: "$author"}
            })


        } else {
            pipeline.push({
                $match: {
                    userId: new ObjectId(req.user._id)
                }
            })
        }


        const bookings = await Booking.aggregate([
            ...pipeline,
            {
                $lookup: {
                    from: "rooms",
                    localField: "roomId",
                    foreignField: "_id",
                    as: "room"
                }
            },
            {
                $unwind: {path: "$room"}
            },
            {
                $project: {
                    "author.password": 0,
                    "author.email": 0,
                    "author.role": 0,
                    "author.isBlocked": 0,
                    "author.status": 0
                }
            }

        ])

        res.status(200).json({bookings: bookings});

    } catch (ex) {
        next(ex)
    }
}


export const cancelBookingRoom = async (req, res, next) => {
    const {bookingId} = req.body
    if (!bookingId) return next("Please provide booking Id");
    try {

        const result = await Booking.updateOne(
            {
                _id: new ObjectId(bookingId),
                userId: new ObjectId(req.user._id)
            },
            {$set: {status: 'cancelled'}}
        );

        res.status(201).json({
            booking: {
                status: 'cancelled'
            }
        });

    } catch (ex) {
        next(ex)
    }
}


// user can check their booked room by their email, room number or reserve id
export const checkInReserve = async (req, res, next) => {
    const {bookingId} = req.body
    if (!bookingId) return next("Please provide booking Id");
    try {

        const result = await Booking.updateOne(
            {
                _id: new ObjectId(bookingId),
                userId: new ObjectId(req.user._id)
            },
            {$set: {status: 'checked-in'}}
        );

        res.status(201).json({
            booking: {
                status: 'checked-in'
            }
        });

    } catch (ex) {
        next(ex)
    }
}


// when guest leave their room.
// then it's mandatory to check out unless pay for next day
export const checkOutReserve = async (req, res, next) => {
    const {bookingId} = req.body
    if (!bookingId) return next("Please provide booking Id");
    try {
        let booked = await Booking.findOne({
            _id: new ObjectId(bookingId),
            userId: new ObjectId(req.user._id),
            status: {$in: ["checked-in", "confirmed"]}
        })

        if (!booked) return next("Sorry, this room already canceled or check outed")

        const result = await Booking.updateOne(
            {
                _id: new ObjectId(bookingId),
                userId: new ObjectId(req.user._id)
            },
            {$set: {status: 'checked-out'}}
        );

        res.status(201).json({
            booking: {
                status: 'checked-out'
            }
        });

    } catch (ex) {
        next(ex)
    }
}


// get popular rooms
export const getPopularRooms = async (req, res, next) => {
    let {pageNumber = 1} = req.query
    let pageSize = 10
    pageNumber = Number(pageNumber)
    if (isNaN(pageNumber)) {
        pageNumber = 1
    }

    try {
        let rooms = await Room.find({}, {
            skip: pageSize * (pageNumber - 1),
            limit: pageSize * pageNumber
        })

        res.status(200).json({
            rooms: rooms
        });

    } catch (ex) {
        next(ex)
    }
}

// filter-by-type
export const getFilterRoomByType = async (req, res, next) => {
    let {pageNumber = 1, roomType} = req.query
    let pageSize = 10
    pageNumber = Number(pageNumber)
    if (isNaN(pageNumber)) {
        pageNumber = 1
    }

    const filter = {}
    if (roomType) {
        filter["roomType"] = roomType
    }

    try {
        let rooms = await Room.find(filter, {
            skip: pageSize * (pageNumber - 1),
            limit: pageSize * pageNumber
        })

        res.status(200).json({
            rooms: rooms
        });

    } catch (ex) {
        next(ex)
    }
}