import { getProfile } from "../services/UserService"
import { rawToSafeUser } from "../utils/mapper/UserMapper"

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

export {
    getProfileHandler,
}