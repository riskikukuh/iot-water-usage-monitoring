import * as schedule from "node-schedule"
import { AppDataSource } from "./data-source"
import { create } from "./services/WaterUsageService"
import * as dotenv from "dotenv"
dotenv.config()

AppDataSource.initialize().then(async () => {

    const userIdTesting = '9d0a806d-0fd5-4558-bedf-f9e5a660a246'
    const unit = 'liter/m'
    
    console.log("Start debug")
    let counter = 0

    const now = new Date()
    let day = now.getDate()
    let month = now.getMonth()
    let year = now.getFullYear()
    let hour = now.getHours()
    let minute = now.getMinutes()

    hour = 0
    minute = 0

    schedule.scheduleJob('* * * * *', async function() {
        counter += 1

        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 60000)
        const usage = Math.floor(Math.random() * 100)

        const id = await create(userIdTesting, usage, +endDate, unit)
        console.log(`Success make water usage with id: ${id}`)
    })
})