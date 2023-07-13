import { getTodayUsage } from "../services/WaterUsageService"
import { getHistories } from "../services/HistoryService"
import { getProfile, create, edit } from "../services/UserService"
import { rawToSafeUser } from "../utils/mapper/UserMapper"
import { AddUserValidator, UpdateUserConfigurationValidator } from "../utils/validator/UserValidator"
import { validate } from "../utils/validator/ValidatorUtil"

async function getProfileHandler(req, res, next) {
    try {
        const { id } = req.auth
        const user = rawToSafeUser(await getProfile(id))

        const now = new Date()
        const month = now.getMonth()
        const year = now.getFullYear()
        
        const startDate = +new Date(year, month, 1, 0, 0, 0)
        const endDate = +new Date(year, month +1, 1, 0, 0, 0)

        const dailyUsages = await getTodayUsage(id)
        const monthlyUsages = await getHistories(id, startDate, endDate)

        let totalMonthlyUsages = 0
        for (let i = 0; i < dailyUsages.length; i++) {
            const usage = dailyUsages[i]
            if (usage.unit.includes('liter')) {
                totalMonthlyUsages += usage.usage / 1000
            } else if (usage.unit.includes('meter')) {
                totalMonthlyUsages += usage.usage
            }
        }
        for (let i = 0; i < monthlyUsages.length; i++) {
            const usage = monthlyUsages[i]
            totalMonthlyUsages += usage.water_usage
        }

        user['monthly_usage'] = totalMonthlyUsages

        res.status(200).json({
            success: false,
            data: user,
        })
    } catch (err) {
        next(err)
    }
}

async function updateConfiguration(req, res, next) {
    try {

        const { id } = req.auth
        const { pricePerMeter, tresholdSystem, treshold } = req.body

        const schema = new UpdateUserConfigurationValidator()
        schema.pricePerMeter = pricePerMeter
        schema.tresholdSystem = tresholdSystem
        schema.treshold = treshold

        await validate(schema)

        await edit(id, pricePerMeter, tresholdSystem, treshold)

        res.status(200).json({
            success: true,
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
    updateConfiguration,
}