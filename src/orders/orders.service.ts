import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { ChangeOrderStatusDto, CreateOrderDto } from './dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { NAST_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Orders service');
  constructor(@Inject(NAST_SERVICE) private readonly nastClient: ClientProxy) {
    //@Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('dataBase connected');
  }
  async create(createOrderDto: CreateOrderDto) {
    // return await this.order.create({ data: createOrderDto });
    try {
      /// confirmar los id de los productois
      const productsId = createOrderDto.items.map((iten) => iten.productId);

      const products = await firstValueFrom(
        this.nastClient.send({ cmd: 'validate_products' }, productsId),
      );

      // calculos de los valores
      const totalAmount = createOrderDto.items.reduce((_acc, orderItem) => {
        const price = products.find(
          (product) => product.id === orderItem.productId,
        ).price;
        return price * orderItem.quantity;
      }, 0);

      const totalItems = createOrderDto.items.reduce((_acc, orderItem) => {
        return _acc + orderItem.quantity;
      }, 0);

      ///crear una transaccion de base de datos
      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: products.find(
                  (product) => product.id === orderItem.productId,
                ).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });
      //return order;
      return {
        ...order,
        OrderItem: order.OrderItem.map((ordenItem) => ({
          ...ordenItem,
          name: products.find((product) => product.id === ordenItem.productId)
            .name,
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        messaje: 'check logs',
      });
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      },
    });
    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;
    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });
    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        messaje: `order whit id ${id} no found`,
      });
    }
    const producstIds = order.OrderItem.map((orderItem) => orderItem.productId);
    const products: any[] = await firstValueFrom(
      this.nastClient.send({ cmd: 'validate_products' }, producstIds),
    );
    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }

  async changeStatus(changeOrderStatus: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatus;
    const order = await this.findOne(id);
    if (order.status === status) {
      return order;
    }
    return this.order.update({
      where: { id },
      data: {
        status: status,
      },
    });
  }
}
