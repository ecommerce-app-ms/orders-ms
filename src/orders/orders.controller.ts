import {
  Controller,
  NotImplementedException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ChangeOrderStatusDto, CreateOrderDto, paidOrderDto } from './dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentsSesion = await this.ordersService.createPaymentSesion(order);
    return {
      order,
      paymentsSesion,
    };
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('changeOrderStatus')
  async changeOrdeStatus(
    @Payload() changeOrderStatusDto: ChangeOrderStatusDto,
  ) {
    return await this.ordersService.changeStatus(changeOrderStatusDto);
  }
  @EventPattern('payment.succeeded')
  async paiOrder(@Payload() paidOrderDto: paidOrderDto) {
    console.log({ paidOrderDto });
    const order = await this.ordersService.paidOrder(paidOrderDto);
    return order;
  }
}
