import { Router } from "express"
import { 
    getProfileHandler,
} from "../controllers/UserController"
import { jwtMiddleware } from "../utils/AuthUtil"

const userRouter = Router()

userRouter.get("/user/profile", jwtMiddleware(), getProfileHandler)


export {
    userRouter,
}