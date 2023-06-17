import formidable from "formidable";
import imageKitUpload from "src/services/ImageKitUpload";
import Hotel from "src/models/Hotel";
import {ObjectId} from "mongodb";


export const createHotel = (req, res, next) => {

    // parse a file upload
    const form = formidable({multiples: false});

    form.parse(req, async (err, fields, files) => {

        if (err) return next("Can't read form data");
        try {
            const {
                name,
                description,
                city,
                _id,
                country,
                street,
                image = ""
            } = fields;


            let imageUrl = "";

            if (files && files.image) {
                let fileName = files.image.newFilename + "-" + files.image.originalFilename
                let uploadInfo = await imageKitUpload(files.image.filepath, fileName, "hotel-booking")
                if (uploadInfo) {
                    imageUrl = uploadInfo.url
                }
            }


            let hotelData = {
                name,
                description,
                image: imageUrl ? imageUrl : image,
                ownerId: new ObjectId(req.user._id),
                address: {
                    street,
                    city,
                    country
                }
            }

            let result = await Hotel.updateOne({
                _id: _id ? new ObjectId(_id) : new ObjectId()
            }, {
                $set: hotelData
            }, {
                upsert: true
            })

            res.status(201).json({hotel: ""});

        } catch (ex) {
            next(ex);
        }
    });
};

export const getAllHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.find({})
        res.status(200).json({hotel: hotel});
    } catch (ex) {
        next(ex);
    }
}
export const getHotelDetail = async (req, res, next) => {
    try {
        const {type, hotelId} = req.query
        if(!hotelId) return next("Please Provide hotel id")
        let hotel = null

        if(type === "edit"){
            hotel = await Hotel.findOne({_id: new ObjectId(hotelId)})
        } else {
            // fetch detail like how many room have for his hotel
            hotel = await Hotel.find({_id: new ObjectId(hotelId)})
        }


        res.status(200).json({hotel: hotel});
    } catch (ex) {
        next(ex);
    }
}