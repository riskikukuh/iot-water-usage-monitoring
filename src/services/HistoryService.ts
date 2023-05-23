import { Between } from "typeorm";
import { AppDataSource } from "../data-source";
import { WaterUsage } from "../entity/WaterUsage";
import { getUsageByDate } from "./WaterUsageService"
import { History } from "../entity/History";
import { getUnit } from "./ConfigService";

async function create(user_id:string, startDate: number, endDate: number) : Promise<string> {
    const waterUsageByGivenTimeRange = await getUsageByDate(user_id, startDate, endDate, true, false)
    let totalUsage = 0
    for (let i = 0; i < waterUsageByGivenTimeRange.length; i++) {
        const e = waterUsageByGivenTimeRange[i];
        totalUsage += e.usage
    }
    const history       = new History()
    history.water_usage = totalUsage
    history.unit        = await getUnit()
    history.start_date  = startDate
    history.end_date    = endDate
    history.created_at  = + new Date()

    const inserted = await AppDataSource.getRepository(History).save(history)

    return inserted.id
}

async function getHistories(user_id: string, startDate: number | null = null, endDate: number | null = null) : Promise<History[]> {
    const data = AppDataSource.getRepository(History).find({
        where: startDate != null && endDate != null ? {
            user_id: user_id,
            created_at: Between(startDate, endDate)
        } : null,
    })

    return data
}

export {
    create, 
    getHistories,
}