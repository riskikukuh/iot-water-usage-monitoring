import { AppDataSource } from "../data-source"
import { Bill } from "../entity/Bill"

async function getAll(user_id: string): Promise<Bill[]> {
    const bills = await AppDataSource.getRepository(Bill).find({
        where: {
            user_id,
        }
    })
    return bills
}

async function create(user_id: string, { waterUsage, unit, startDate, endDate, nominal, pricePerMeter }): Promise<string> {

    const bill = new Bill()
    bill.user_id = user_id
    bill.water_usage = waterUsage,
    bill.unit = unit
    bill.start_date = startDate
    bill.end_date = endDate
    bill.nominal = nominal
    bill.price_per_meter = pricePerMeter    
    bill.created_at = +new Date()

    const resultInsert = await AppDataSource.getRepository(Bill).save(bill)

    return resultInsert.id
}

async function deleteBill(billId: string): Promise<boolean> {
    await AppDataSource.getRepository(Bill).delete({
        id: billId,
    })
    const bill = await AppDataSource.getRepository(Bill).findOneBy({
        id: billId,
    })
    return bill == null
}

export {
    getAll,
    create,
    deleteBill,
}