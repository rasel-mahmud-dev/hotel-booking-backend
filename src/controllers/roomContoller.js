import formidable from "formidable";
import imageKitUpload from "src/services/ImageKitUpload";
import Hotel from "src/models/Hotel";
import {ObjectId} from "mongodb";
import Room from "src/models/Room";



export const createRoom = (req, res, next) => {

    // parse a file upload
    const form = formidable({multiples: false});

    form.parse(req, async (err, fields, files) => {

        if (err) return next("Can't read form data");
        try {
            const {
                roomNo,
                hotelId,
                roomType,
                description ,
                capacity = 1,
                image = "",
                price,
                _id,
            } = fields;


            let imageUrl = "";

            // check this hotel is created current logged user or not
            if(!hotelId){
                return next("Please select your hotel")
            }

            let hotel = await Hotel.findOne({
                _id: new ObjectId(hotelId),
                ownerId: new ObjectId(req.user._id)
            })
            if(!hotel) {
                return next("Please select your created hotel")
            }

            if (files && files.image) {
                let fileName = files.image.newFilename + "-" + files.image.originalFilename
                let uploadInfo = await imageKitUpload(files.image.filepath, fileName, "hotel-booking")
                if (uploadInfo) {
                    imageUrl = uploadInfo.url
                }
            }


            let newRoomData = {
                description,
                image: imageUrl ? imageUrl : image,
                roomNo,
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


export const filterRooms = async (req, res, next)=>{
    try{

        const {
            search, 
            price = [], 
            roomType, 
            capacity, 
            city,
            bookingStartDate,
        } = req.body

    

        let filterPrice = []
        if(price && Array.isArray(price) && price.length === 2){
            filter["price"] = [{ $gte: price[0] }]
            filter["price"].push({ $lte: price[1] })
        }
        if(roomType){
            filterPrice.push({roomType})
        }
        if(capacity){
            filterPrice.push({capacity})
        }
        if(city){
            filterPrice.push({city: city})
        }
        let orFilter = []

        // search via room name or hotel name 
        if(search){
            or.push({
                roomName: { $regex: search },
                roomNumber: { $regex: search },
            })
        }

        let rooms  = await Room.aggregate([
            {
                $match: {
                    // $and: filterPrice,
                //  $or: orFilter
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
                    roomNo: 1,
                    image: 1,
                    description: 1,
                    price: 1,
                    roomType: 1, 
                    capacity: 1, 
                    city: 1,
                    hotel: {
                        name: 1,
                        image: 1
                    },
                    owner:{
                        fullName: 1,
                        avatar: 1
                    }
                }
            }
        ])

        res.status(200).json({rooms: rooms});

    } catch(ex){
        next(ex)
    }
}


export const reserveRoom = async (req, res, next)=>{
    try{
        const {
            startDate, 
            endDate, 
            roomId
        } = req.body



        res.status(200).json({rooms: rooms});

    } catch(ex){
        next(ex)
    }
}


// user can check their booked room by their email, room number or reserve id
export const checkInReserve = async (req, res, next)=>{
    try{
        const {
            startDate, 
            endDate, 
            roomId
        } = req.body

        

        res.status(200).json({rooms: rooms});

    } catch(ex){
        next(ex)
    }
}



// when guest leave their room. 
// then it's mandatory to checkOut unless pay for next day
export const checkOutReserve = async (req, res, next)=>{
    try{
        const {
            reserveId
        } = req.body 

        


        res.status(200).json({rooms: rooms});

    } catch(ex){
        next(ex)
    }
}