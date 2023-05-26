import { getProfile, create } from "../services/UserService"
import { rawToSafeUser } from "../utils/mapper/UserMapper"
import { AddUserValidator } from "../utils/validator/UserValidator"
import { validate } from "../utils/validator/ValidatorUtil"

async function getProfileHandler(req, res, next) {
    try {
        const { id } = req.auth
        const user = rawToSafeUser(await getProfile(id))
        res.status(200).json({
            success: false,
            data: user,
        })
    } catch (err) {
        next(err)
    }
}

async function postCreateUserHandler(req, res, next) {
    try {
        const {  email, firstname, lastname, address, latitude, longitude, password } = req.body

        const schema = new AddUserValidator()
        schema.email = email
        schema.firstname = firstname
        schema.lastname = lastname
        schema.address = address
        schema.latitude = latitude
        schema.longitude = longitude
        schema.password = password

        await validate(schema)

        const insertedId = await create(req.body)
        
        res.status(200).json({
            success: false,
            data: {
                id: insertedId,
            },
        })
    } catch (err) {
        next(err)
    }
}

export {
    getProfileHandler,
    postCreateUserHandler,
}