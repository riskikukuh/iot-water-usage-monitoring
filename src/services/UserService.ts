import { AppDataSource } from "../data-source"
import { User } from "../entity/User"
import { NotFoundError } from "../utils/errors/NotFoundError";

async function getAllUser(isActive: boolean): Promise<User[]> {
    const user = await AppDataSource.getRepository(User).find({
        where: {
            is_active: isActive ? 1 : 0,
        }
    })
    return user
}

async function findUser(email: string, password: string): Promise<User> {
    const nodeEnvParams = process.env.NODE_ENV == 'prod' ? ` AND user.role != 'none'` : ''
    const user = await AppDataSource.createQueryBuilder(User, 'user')
        .where(`user.email = :email AND user.password = :password ${nodeEnvParams}`, {
            email,
            password
        })
        .getOne()

    if (!user) {
        throw new NotFoundError('Email / Password incorect!')
    }
    return user
}

async function getProfile(id: string): Promise<User> {
    const user = await AppDataSource.getRepository(User).findOne({
        where: {
            id: id,
        }
    })
    if (!user) {
        throw new NotFoundError('User not found!');
    }
    return user
}

export {
    findUser,
    getProfile,
    getAllUser,
}

// async function create(usage: number, usage_at: number, unit: string) : Promise<string> {
//     const newWaterUsage      = new User()
//     newWaterUsage.usage      = usage
//     newWaterUsage.unit       = unit,
//     newWaterUsage.usage_at   = usage_at
//     newWaterUsage.created_at = +new Date()

//     const inserted = await AppDataSource.getRepository(WaterUsage).save(newWaterUsage)

//     return inserted.id
// }