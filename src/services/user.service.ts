import { UploadApiResponse } from 'cloudinary'
import { IUser } from '../interface/user.interface'
import { User } from '../models/user.model'
import { uploadToCloudinary } from '../utils/cloudinary'

export const createUser = async (
  userData: Partial<IUser>,
  avatarPath?: string
): Promise<IUser> => {
  let avatar

  if (avatarPath) {
    const cloudinaryResponse = await uploadToCloudinary(avatarPath)
    if (cloudinaryResponse) {
      avatar = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      }
    }
  }

  const newUser = await User.create({
    ...userData,
    ...(avatar && { avatar }),
  })

  return newUser
}
