import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

export const avatarUploader=multer({
    storage:new CloudinaryStorage({
        cloudinary,
        params:{
            folder:"Capstone/Users/Avatar"
        }as {folder:string}
    })
}).single("Avatar")

export const EventPictureUploader=multer({
    storage:new CloudinaryStorage({
        cloudinary,
        params:{
            folder:"Capstone/Events/Picture"
        }as {folder:string}
    })
}).single("Picture")

