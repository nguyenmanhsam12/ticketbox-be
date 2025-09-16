import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CategoriesModule } from './modules/categories/categories.module';
import { EventsModule } from './modules/events/events.module';
import { PermissionEventModule } from './modules/permission-event/permission-event.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ShowsModule } from './modules/shows/shows.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import cloudinaryConfig from './config/cloudinary.config';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { CartModule } from './modules/cart/cart.module';
import { CartItemModule } from './modules/cart-item/cart-item.module';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { OrderItemModule } from './modules/order-item/order-item.module';
import { PaymentTransactionModule } from './modules/payment-transaction/payment-transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [cloudinaryConfig],
    }),
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    EventsModule,
    PermissionEventModule,
    PermissionsModule,
    ShowsModule,
    TicketsModule,
    CloudinaryModule,
    CartModule,
    CartItemModule,
    PaymentMethodModule,
    UserModule,
    OrderModule,
    OrderItemModule,
    PaymentTransactionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
