import { Entity, PrimaryGeneratedColumn, Column, Long } from "typeorm"

@Entity({
    name: "bills",
})
export class Bill {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    user_id: string

    @Column()
    water_usage: number

    @Column()
    unit: string

    @Column()
    start_date: number

    @Column()
    end_date: number

    @Column()
    nominal: number

    @Column()
    price_per_meter: number

    @Column({
        default: +new Date()
    })
    created_at: number
}
