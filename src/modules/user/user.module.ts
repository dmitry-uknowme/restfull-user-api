import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from '../../entities/user.entity';
import { UserService } from './user.service';
import { Role } from 'src/entities/role.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User, Role])],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}
