import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PRODUCT_SERVICE, envs } from 'src/config';
import { NastModule } from 'src/transports/nast.module';

@Module({
  imports: [
    /* ClientsModule.register([
      {
        name: PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.products_microservices_host,
          port: envs.products_microservices_port,
        },
      },
    ]),*/
    NastModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
