import { IsIn, IsInt, IsNotEmpty, IsString, IsUUID, Min } from "class-validator";

export class WaterUsageValidator {
    
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    user_id: string

    @IsInt()
    @Min(0)
    usage: number

    @IsNotEmpty()
    unit: string

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    usage_at: number
}