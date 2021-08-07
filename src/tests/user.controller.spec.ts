import { HttpException, HttpStatus } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../entities/role.entity';
import { CreateUserPayload, UpdateUserPayload } from 'src/modules/user/user.payload';
import { User } from '../entities/user.entity';
import { UserController } from '../modules/user/user.controller';
import { UserService } from '../modules/user/user.service';

interface CreateUserFailed {
	success: boolean;
	status: typeof HttpStatus.BAD_REQUEST;
	errors: string[];
}

interface ITestData {
	getOne: { payloads: number[]; results: User[] | any };
	getAll: { result: UserWithRoles[] };
	create: { payloads: CreateUserPayload[] | any[]; results: (User & { success: boolean })[] | any };
	update: { payloads: UpdateUserPayload[] | any[]; results: (User & { success: boolean })[] | any };
	remove: { payloads: number[]; results: number[] };
}

interface UserWithRoles extends User {
	roles: RolesOfUsers[];
}
interface RolesOfUsers extends Role {
	users: UserWithRoles[];
}

const testDB: any /* UserWithRoles[] */ = [
	{
		id: 1,
		login: 'nikita-bayderin',
		password: '9U)Hf(r',
		roles: [{ id: 1, name: 'Viewer' }],
	},
	{
		id: 2,
		login: 'alexander-chebaev',
		password: '^skG;56W!g*-/',
		roles: [
			{
				id: 1,
				name: 'Viewer',
			},
			{
				id: 2,
				name: 'Editor',
			},
		],
	},
	{
		id: 3,
		login: 'dmitry-bogatyrev',
		password: 'hcvnnwxfdbvdh2A',
		roles: [
			{
				id: 1,
				name: 'Viewer',
			},
			{
				id: 2,
				name: 'Editor',
			},
			{
				id: 3,
				name: 'Admin',
			},
		],
	},
];

const testData: ITestData = {
	getOne: {
		payloads: [1, 3],
		results: [testDB[0], testDB[2]],
	},
	getAll: { result: testDB },
	create: {
		payloads: [
			{ login: 'nikita-bayderin', password: '9U)Hf(r' },
			{ login: 'alexander-chebaev', password: '^skG;56W!g*-/' },
			{ log: 'dmitry-bogatyrev', pass: 'hcvnnwxfdbvdh2A' },
			{ log: 'dmitry-bogatyrev', password: 'hcvnnwxfdbvdh2A' },
			{ login: 'dmitry-bogatyrev', pass: 'hcvnnwxfdbvdh2A' },
			{ login: 'dmitry-bogatyrev', password: 'hcvnnwxfdbvdh' },
		],
		results: [
			{ login: 'nikita-bayderin', password: '9U)Hf(r', roles: [], id: 1, success: true },
			{ login: 'alexander-chebaev', password: '^skG;56W!g*-/', roles: [], id: 1, success: true },
			{ errors: ['login was not provided', 'password was not provided'], success: false, status: HttpStatus.BAD_REQUEST },
			{ errors: ['login was not provided'], success: false, status: HttpStatus.BAD_REQUEST },
			{ errors: ['password was not provided'], success: false, status: HttpStatus.BAD_REQUEST },
			{ errors: ['password must contains at least one numeric character', 'password must contains at least one capital letter'], success: false, status: HttpStatus.BAD_REQUEST },
		],
	},
	update: {
		payloads: [
			{ id: 3, payload: { roles: [] } },
			{ id: 2, payload: { login: 'alex' } },
			{
				id: 1,
				payload: {
					roles: [
						{
							id: 3,
							name: 'Admin',
						},
					],
				},
			},
			{ id: 2, payload: { password: 'qwe' } },
			{ id: 3, payload: { password: 'qweWA' } },
			{ id: 1, payload: { password: 'qwe412421' } },
		],
		results: [
			{ id: 3, login: 'dmitry-bogatyrev', password: 'hcvnnwxfdbvdh2A', roles: [] },
			{
				id: 2,
				login: 'alex',
				password: '^skG;56W!g*-/',
				roles: [
					{
						id: 1,
						name: 'Viewer',
					},
					{
						id: 2,
						name: 'Editor',
					},
				],
			},
			{
				id: 1,
				login: 'nikita-bayderin',
				password: '9U)Hf(r',
				roles: [
					{
						id: 3,
						name: 'Admin',
					},
				],
			},

			{ errors: ['password must contains at least one numeric character', 'password must contains at least one capital letter'], success: false, status: HttpStatus.BAD_REQUEST },
			{ errors: ['password must contains at least one numeric character'], success: false, status: HttpStatus.BAD_REQUEST },
			{ errors: ['password must contains at least one capital letter'], success: false, status: HttpStatus.BAD_REQUEST },
		],
	},
	remove: { payloads: [2, 1, 3], results: [2, 1, 3] },
};

describe('UserController', () => {
	let userController: UserController;
	let userService: UserService;

	class MockUserService {
		getOne(id: number) {
			return testDB.find((user: User) => user.id === id);
		}
		getAll() {
			return testDB;
		}
		create(payload: CreateUserPayload) {
			const errors = [];
			let response: Object = { success: true };

			if (!payload.login || payload?.login?.trim() === '') {
				errors.push('login was not provided');
			}

			if (payload?.password && payload?.password?.trim() !== '') {
				if (!payload.password.match(/\d+/g)) {
					errors.push('password must contains at least one numeric character');
				}
				if (!payload.password.match(/[A-Z]/g)) {
					errors.push('password must contains at least one capital letter');
				}
			} else {
				errors.push('password was not provided');
			}

			if (errors.length) {
				return { ...response, success: false, status: HttpStatus.BAD_REQUEST, errors };
			}

			const user = { ...payload, roles: [], id: 1 };
			return { ...user, ...response };
		}
		update(id: number, payload: UpdateUserPayload) {
			const errors = [];
			let response: Object = { success: true };

			if (payload.password && payload?.password?.trim() !== '') {
				if (!payload.password.match(/\d+/g)) {
					errors.push('password must contains at least one numeric character');
				} else if (!payload.password.match(/[A-Z]/g)) {
					errors.push('password must contains at least one capital letter');
				}
			}

			if (errors.length) {
				return { ...response, success: false, status: HttpStatus.BAD_REQUEST, errors };
			}

			const user = testDB.find((user: User) => user.id === id);
			return { ...user, ...payload };
		}
		remove(id: number) {
			return id;
		}
	}

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [UserController],
			providers: [UserService],
		})
			.overrideProvider(UserService)
			.useClass(MockUserService)
			.compile();

		userService = moduleRef.get<UserService>(UserService);
		userController = moduleRef.get<UserController>(UserController);
	});

	describe('getOne', () => {
		const { payloads, results } = testData.getOne;

		payloads.map((payload, id) => {
			it(`should return user with given id ${id + 1}/${payloads.length}`, async () => {
				expect(Promise.resolve(userController.getOne(payload))).resolves.toStrictEqual(results[id]);
			});
		});
		payloads.map((payload, id) => {
			it(`should call getOne method with given parametres ${id + 1}/${payloads.length}`, async () => {
				const spy = jest.spyOn(userService, 'getAll').mockImplementation(async () => results[id]);
				await userController.getAll();
				expect(spy).toHaveBeenCalledWith();
			});
		});
	});

	describe('getAll', () => {
		const { result } = testData.getAll;

		it(`should return all of users 1/1`, async () => {
			expect(Promise.resolve(userController.getAll())).resolves.toStrictEqual(result);
		});
		it(`should call getAll method with given parametres 1/1`, async () => {
			const spy = jest.spyOn(userService, 'getAll').mockImplementation(async () => result);
			await userController.getAll();
			expect(spy).toHaveBeenCalledWith();
		});
	});

	describe('create', () => {
		const { payloads, results } = testData.create;

		payloads.map((payload: CreateUserPayload | any, id: number) => {
			switch (id) {
				case 2:
					return it(`should return login and password was not provided ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.create(payload))).resolves.toStrictEqual(results[id]);
					});
				case 3:
					return it(`should return login was not provided ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.create(payload))).resolves.toStrictEqual(results[id]);
					});
				case 4:
					return it(`should return password was not provided ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.create(payload))).resolves.toStrictEqual(results[id]);
					});
				case 5:
					return it(`should return 2 errors in password ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.create(payload))).resolves.toStrictEqual(results[id]);
					});
				default:
					return it(`should create new user  ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.create(payload))).resolves.toStrictEqual(results[id]);
					});
			}
		});
		payloads.map(async (payload: CreateUserPayload | any, id: number) => {
			it(`should call create method with given parametres ${id + 1}/${payloads.length}`, async () => {
				const spy = jest.spyOn(userService, 'create').mockImplementation(async (payload) => results[id]);
				await userController.create(payload);
				expect(spy).toHaveBeenCalledWith(payload);
			});
		});
	});
	describe('update', () => {
		const { payloads, results } = testData.update;

		payloads.map((payload: UpdateUserPayload | any, id: number) => {
			switch (id) {
				case 3:
					return it(`should return 2 errors in password ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.update(payload.id, payload.payload))).resolves.toStrictEqual(results[id]);
					});
				case 3:
					return it(`should return number error in password ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.update(payload.id, payload.payload))).resolves.toStrictEqual(results[id]);
					});
				case 4:
					return it(`should return capital letter error in password ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.update(payload.id, payload.payload))).resolves.toStrictEqual(results[id]);
					});
				default:
					return it(`should update user with given id ${id + 1}/${payloads.length}`, async () => {
						expect(Promise.resolve(userController.update(payload.id, payload.payload))).resolves.toStrictEqual(results[id]);
					});
			}
		});
		payloads.map(async (payload: UpdateUserPayload | any, id: number) => {
			it(`should call update method with given parametres ${id + 1}/${payloads.length}`, async () => {
				const spy = jest.spyOn(userService, 'update').mockImplementation(async (payload) => results[id]);
				await userController.update(payload.id, payload.payload);
				expect(spy).toHaveBeenCalledWith(payload.id, payload.payload);
			});
		});
	});
	describe('remove', () => {
		const { payloads, results } = testData.remove;

		payloads.map(async (payload, id) => {
			it(`should remove user with given id ${id + 1}/${payloads.length}`, async () => {
				expect(Promise.resolve(userController.remove(payload))).resolves.toStrictEqual(results[id]);
			});
		});
		payloads.map(async (payload, id) => {
			it(`should call remove method with given parametres ${id + 1}/${payloads.length}`, async () => {
				const spy = jest.spyOn(userService, 'remove').mockImplementation(async () => results[id]);
				await userController.remove(payload);
				expect(spy).toHaveBeenCalledWith();
			});
		});
	});
});
