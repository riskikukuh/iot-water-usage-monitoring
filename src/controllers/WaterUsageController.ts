import { create, getTodayUsage, getUsageByDate, getLatestUsage } from "../services/WaterUsageService"
import { getHistories } from "../services/HistoryService"
import { verifyUser } from "../services/UserService"
import { validate } from "../utils/validator/ValidatorUtil"
import { WaterUsageValidator } from "../utils/validator/WaterUsageValidator"
import { Server } from "socket.io"
import { pushFCMNotification, create as createNotif } from "../services/NotificationService"
import { NotificationType } from "../utils/NotificationUtil"
import { getTimeNotificationMuted, getTreshold, getTresholdSystem } from "../services/ConfigService"
import AuthUtil = require("../utils/AuthUtil")
import { getProfile, updateTresholdCounter } from "../services/UserService"

async function addWaterUsageHandler(req, res, next) {
    try {
        const socket = res.io
        const { usage, user_id, usage_at, unit } = req.body
        const body = new WaterUsageValidator()
        body.user_id = user_id
        body.unit = unit
        body.usage = usage
        body.usage_at = usage_at

        await validate(body);
        await verifyUser(user_id)

        const user = await getProfile(user_id)

        const insertedWaterUsage = await create(user_id, usage, usage_at, unit)

        if (insertedWaterUsage) {
            socket.of('/updateWaterUsage').to(user_id).emit('updateUsages', {
                usage: usage,
                unit: unit,
                usage_at: usage_at,
            })
        }

        const maxTresholdCounter = 5

        if (user.treshold_system == "on") {
            const treshold = user.treshold
            if (treshold > 0) {
                // const todayUsages = await getTodayUsage(user_id)
                const now = new Date()
                // now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
                const month = now.getMonth()
                const year = now.getFullYear()

                const startDate = +new Date(year, month, 1, 0, 0, 0)
                const endDate = +new Date(year, month +1, 1, 0, 0, 0)

                console.log(`StartDate this month ${startDate}`)
                console.log(`EndDate this month ${endDate}`)
                
                const dailyUsages = await getTodayUsage(user_id)
                const monthlyUsages = await getHistories(user_id, startDate, endDate)

                console.log(`Daily usage ${dailyUsages}`)
                console.log(`Monthly usage ${monthlyUsages}`)

                let totalTodayUsages = 0
                for (let i = 0; i < dailyUsages.length; i++) {
                    const usage = dailyUsages[i]
                    if (usage.unit.includes('liter')) {
                        totalTodayUsages += usage.usage / 1000
                    } else if (usage.unit.includes('meter')) {
                        totalTodayUsages += usage.usage
                    }
                }
                for (let i = 0; i < monthlyUsages.length; i++) {
                    const usage = monthlyUsages[i]
                    totalTodayUsages += usage.usage
                }
                let newTresholdCounter = 0
                if (totalTodayUsages >= treshold) {
                    if (user.treshold_counter >= maxTresholdCounter) {
                        newTresholdCounter = 0
                        const msgId = await pushFCMNotification(user_id, "Peringatan Penggunaan Air", "Jumlah pemakaian hari ini telah mencapai ambang batas!", NotificationType.ALERT)
                    } else {
                        newTresholdCounter = user.treshold_counter + 1
                    }
                    await updateTresholdCounter(user_id, newTresholdCounter)
                }
            }
        }

        res.statusCode = 201
        res.json({
            success: true,
            data: {
                id: insertedWaterUsage,
            }
        })
    } catch (err) {
        console.error(`Error ${err}`);
        next(err);
    }
}

async function getTodayWaterUsageHandler(req, res, next) {
    try {
        const { id } = req.auth
        const todayWaterUsages = await getTodayUsage(id)

        todayWaterUsages.sort((a, b) => a.created_at > b.created_at ? 1 : -1);

        res.statusCode = 200
        res.json({
            success: true,
            data: todayWaterUsages,
        })
    } catch (err) {
        console.error(`Error, ${err}`)
        next(err)
    }
}

async function getHistoyWaterUsageHandler(req, res, next) {
    try {
        const { id } = req.auth
        const history = await getHistories(id)

        res.statusCode = 200
        res.json({
            success: true,
            data: history,
        })
    } catch (err) {
        console.error(`Error ${err}`)
        next(err)
    }
}

async function setupSocketWaterUsage(socket: Server) {
    const waterUsage = socket.of('/updateWaterUsage')

    waterUsage.on('connection', function (socket) {
        console.log('A user connected')

        const { "x-authorization": token } = socket.handshake.headers;

        try {
            const user = AuthUtil.validateToken(token)
            socket.join(user.id)

            socket.on('updateUsages', function (message) {
                console.log(message)
            })
        } catch (err) {
            const errMsg = err.message || 'Something went wrong!'
            const errorResponse = {
                success: false,
                status: 403,
                message: errMsg,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            }
            socket.emit('error', errorResponse)
            socket.disconnect();
        }

        //Whenever someone disconnects this piece of code executed
        socket.on('disconnect', function () {
            console.log('A user disconnected')
        })
    })
    return waterUsage
}

export {
    addWaterUsageHandler,
    setupSocketWaterUsage,
    getTodayWaterUsageHandler,
    getHistoyWaterUsageHandler,
}