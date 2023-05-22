import { Between } from "typeorm";
import { AppDataSource } from "../data-source";
import { WaterUsage } from "../entity/WaterUsage";
import { getUnit } from "./ConfigService"

async function create(user_id: string, usage: number, usage_at: number, unit: string) : Promise<string> {
    const newWaterUsage      = new WaterUsage()
    newWaterUsage.user_id    = user_id
    newWaterUsage.usage      = usage
    newWaterUsage.unit       = unit,
    newWaterUsage.usage_at   = usage_at
    newWaterUsage.created_at = +new Date()

    const inserted = await AppDataSource.getRepository(WaterUsage).save(newWaterUsage)

    return inserted.id
}

async function getTodayUsage(group5minute: boolean = true) : Promise<WaterUsage[]> {
    const tempDate   = new Date()
    const startDate  = +new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0)
    const endDate    = +new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 24, 0, 0)

    const data = await getUsageByDate(startDate, endDate, group5minute)
    return data
}

async function getUsageByDate(startDateParams: number, endDateParams: number, group5minute: boolean = true, dateRestriction : boolean = true) : Promise<WaterUsage[]> {
    const data = await AppDataSource.getRepository(WaterUsage).find({
        where: {
            usage_at: Between(startDateParams, endDateParams),
        }
    })
    
    const resultWaterUsages = []

    if (group5minute) {
        
        const now = new Date()
        const unit = await getUnit()

        let minute = 5
        let condition = true

        while (condition) {
            let startDate: number = 0
            if (minute == 5) {
                startDate = +new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
            } else {
                startDate = +new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, minute - 5, 0)
            }
            
            const endDate = +new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, minute, 0)

            const waterUsage5Minutes = data.filter(( e ) => { 
                return e.usage_at >= startDate && e.usage_at < endDate
            })

            let usage5Minute = 0
            for (let i = 0; i < waterUsage5Minutes.length; i++) {
                const e = waterUsage5Minutes[i];
                usage5Minute += e.usage
            }

            resultWaterUsages.push({
                usage: usage5Minute,
                unit,
                startDate,
                endDate,
            })

            if (dateRestriction && +now < endDate) {
                condition = false
            }
            
            if (minute >= 1440) {
                condition = false
            }

            minute += 5
        }

        return resultWaterUsages
    } 
    
    return data
}

export {
    create,
    getTodayUsage,
    getUsageByDate,
}