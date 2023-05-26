import { Router } from "express"
import { 
    getProfileHandler,
    postCreateUserHandler,
} from "../controllers/UserController"
import { jwtMiddleware } from "../utils/AuthUtil"

const userRouter = Router()

userRouter.get("/user/profile", jwtMiddleware(), getProfileHandler)

userRouter.post('/user', postCreateUserHandler)


export {
    userRouter,
}