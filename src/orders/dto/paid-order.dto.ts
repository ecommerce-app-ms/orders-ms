import { IsString, IsUUID, IsUrl } from 'class-validator';

export class paidOrderDto {
  @IsString()
  stripePaymentId: string;
  @IsString()
  @IsUUID()
  orderId: string;
  @IsString()
  @IsUrl()
  receipUrl: string;
}
