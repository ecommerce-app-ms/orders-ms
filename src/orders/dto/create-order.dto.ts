import { OrderStatus } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { orderStatusList } from '../enum/order.enum';
import { Type } from 'class-transformer';
import { OrderitemDto } from './order-items.dto';

export class CreateOrderDto {
  /* @IsNumber()
  @IsPositive()
  totalAmount: number;
  @IsNumber()
  @IsPositive()
  totalItems: number;
  @IsOptional()
  @IsEnum(orderStatusList, {
    message: ` possible status values are ${orderStatusList}`,
  })
  status: OrderStatus = OrderStatus.PENDING;
  @IsBoolean()
  @IsOptional()
  paid = false;*/
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderitemDto)
  items: OrderitemDto[];
}
