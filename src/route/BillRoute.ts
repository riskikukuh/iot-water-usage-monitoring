import { Router } from "express"
import { 
    getAllBill
} from "../controllers/BillController"
import { jwtMiddleware } from "../utils/AuthUtil"

const billRouter = Router()

billRouter.get("/bills", jwtMiddleware(), getAllBill)

// Disabled
// billRouter.post('/bills', jwtMiddleware(), postCreateUserHandler)


export {
    billRouter,
}