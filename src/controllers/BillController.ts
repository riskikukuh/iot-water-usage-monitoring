import { User } from "../entity/User"
import {
    getAll,
    create,
} from "../services/BillService"
import {
    getProfile
} from "../services/UserService"
import {
    getUsageAndPriceByDate
} from "../services/HistoryService"
import { getUnit } from "../services/ConfigService"
import {
    pushFCMNotification
} from "../services/NotificationService"
import { NotificationType } from "../utils/NotificationUtil"

async function getAllBill(req, res, next) {
    try {
        const { id } = req.auth
        const bills = await getAll(id)
        res.status(200).json({
            success: true,
            data: bills,
        })
    } catch (err) {
        next(err)
    }
}

async function createBillNonApi(userId: string, startDate: number, endDate: number) {
    try {
        const unit = await getUnit()
        const user = await getProfile(userId)
        const { totalUsage, totalBill } = await getUsageAndPriceByDate(userId, startDate, endDate)
        // const billId = ''
        const billId = await create(userId, {
            waterUsage: totalUsage,
            startDate,
            endDate,
            nominal: totalBill,
            pricePerMeter: user.price_per_meter,
            unit,
        })
        const now = new Date(startDate)
        
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const thisMonthName = monthNames[now.getMonth()]

        const billTitle = `Tagihan untuk bulan ${thisMonthName}`
        const billDescription = `
            Halo tagihan untuk bulan ${thisMonthName} telah dibuat.
            Tagihan anda sebesar ${totalBill} dengan harga per meter ${user.price_per_meter}
        `

        if (billId) {
            await pushFCMNotification(userId, billTitle, billDescription, NotificationType.REMINDER)
        }

        return billId
    } catch (err) {
        console.error(`# createNonApi: ${err}`)
    }
}


// Disabled
// async function createBill(req, res, next) {
//     try {
//         const { id } = req.auth


//         const billId = await create(id, {})
//         res.status(201).json({
//             success: true,
//             data: 
//         })
//     } catch (err) {
//         next(err)
//     }
// }

export {
    getAllBill,
    createBillNonApi
}