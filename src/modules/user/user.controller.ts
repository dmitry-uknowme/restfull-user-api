import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserPayload } from './user.payload';
import { UserService } from './user.service';

@Controller('/api/users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get(':id')
	getOne(@Param('id') id: string) {
		return this.userService.getOne(id);
	}

	@Get()
	getAll() {
		return this.userService.getAll();
	}

	@Post()
	create(@Body() payload: CreateUserPayload) {
		return this.userService.create(payload);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() payload: CreateUserPayload) {
		return this.userService.update(id, payload);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.userService.remove(id);
	}
}
