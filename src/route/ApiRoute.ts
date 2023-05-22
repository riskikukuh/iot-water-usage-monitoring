import { Router } from "express"
import { AuthError } from "../utils/errors/AuthError";
import { configRouter } from "../route/ConfigRoute"
import { authRouter } from "../route/AuthRoute"
import { userRouter } from "../route/UserRoute"
import { waterUsageRouter } from "../route/WaterUsageRoute"
import { notificationRouter } from "../route/NotificationRoute"
import { jwtMiddleware } from "../utils/AuthUtil";

const apiRouter = Router()

apiRouter.use('/api', authRouter)
apiRouter.use('/api', userRouter)
apiRouter.use('/api', waterUsageRouter)
apiRouter.use('/api', notificationRouter)
apiRouter.use('/api', configRouter)

export {
    apiRouter,
}