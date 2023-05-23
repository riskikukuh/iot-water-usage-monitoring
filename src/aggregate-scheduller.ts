import * as schedule from "node-schedule"
import { AppDataSource } from "./data-source"
import { create } from "./services/HistoryService"

AppDataSource.initialize().then(async () => {
    console.log("Start debug")
    
    const userIdTesting = '9d0a806d-0fd5-4558-bedf-f9e5a660a246'

    schedule.scheduleJob('0 0 * * *', async function() {
        const now = new Date()
        const day = now.getDate()
        const month = now.getMonth()
        const year = now.getFullYear()

        const startDate = +new Date(year, month, day - 1, 0, 0, 0)
        const endDate = +new Date(year, month, day, 0, 0, 0)

        console.log(`# Aggregating usage for 1 day, start: ${+startDate} end: ${+endDate}`)

        const id = await create(userIdTesting, startDate, endDate)
        console.log(`Success make aggregate with id: ${id}`)
    })
})