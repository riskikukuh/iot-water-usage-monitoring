import { create, getTodayUsage, getUsageByDate } from "../services/WaterUsageService"
import { getHistories } from "../services/HistoryService"
import { validate } from "../utils/validator/ValidatorUtil"
import { WaterUsageValidator } from "../utils/validator/WaterUsageValidator"
import { Server } from "socket.io"
import { pushFCMNotification, create as createNotif } from "../services/NotificationService"
import { NotificationType } from "../utils/NotificationUtil"
import { getTimeNotificationMuted, getTreshold, getTresholdSystem } from "../services/ConfigService"

async function addWaterUsageHandler(req, res, next) {
    try {
        const { usage, user_id, usage_at, unit } = req.body
        const body = new WaterUsageValidator()
        body.user_id = user_id
        body.unit = unit
        body.usage = usage
        body.usage_at = usage_at

        await validate(body);

        const insertedWaterUsage = await create(user_id, usage, usage_at, unit)

        if (await getTresholdSystem()) {
            const treshold = await getTreshold()
            if (treshold > 0) {
                const todayUsages = await getTodayUsage(user_id)
                let totalTodayUsages = 0
                for (let i = 0; i < todayUsages.length; i++) {
                    const usage = todayUsages[i]
                    totalTodayUsages += usage.usage
                }
                if (totalTodayUsages >= treshold) {
                    const mutedTime = await getTimeNotificationMuted()
                    const now = +new Date()
                    if ( mutedTime < 1 || (mutedTime > 0 && now > mutedTime)) {
                        const msgId = await pushFCMNotification("Peringatan Penggunaan Air", "Jumlah pemakaian hari ini telah mencapai ambang batas!", NotificationType.ALERT)
                    }
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
    } catch(err) {
        console.error(`Error ${err}`);
        next(err);
    }
}

async function getTodayWaterUsageHandler(req, res, next) {
    try {
        const { id } = req.auth
        const todaWaterUsages = await getTodayUsage(id)

        res.statusCode = 200
        res.json({
            success: true,
            data: todaWaterUsages,
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
    waterUsage.on('connection', function(socket) {
        console.log('A user connected')

        //Whenever someone disconnects this piece of code executed
        socket.on('disconnect', function () {
            console.log('A user disconnected')
        })
    })
}

export {
    addWaterUsageHandler,
    setupSocketWaterUsage,
    getTodayWaterUsageHandler,
    getHistoyWaterUsageHandler,
}