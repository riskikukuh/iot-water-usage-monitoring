import { Router } from "express"
import { 
    getProfileHandler,
    postCreateUserHandler,
    updateConfiguration,
} from "../controllers/UserController"
import { jwtMiddleware } from "../utils/AuthUtil"

const userRouter = Router()

userRouter.get("/user/profile", jwtMiddleware(), getProfileHandler)

userRouter.post('/user', postCreateUserHandler)

userRouter.post('/user/config', jwtMiddleware(), updateConfiguration)


export {
    userRouter,
}