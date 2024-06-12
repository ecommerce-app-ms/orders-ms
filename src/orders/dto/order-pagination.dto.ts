import { OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { paginationDto } from 'src/common';
import { orderStatusList } from '../enum/order.enum';

export class OrderPaginationDto extends paginationDto {
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: `valid status are ${orderStatusList}`,
  })
  status?: OrderStatus;
}
