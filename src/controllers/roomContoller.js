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
                roomName,
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
