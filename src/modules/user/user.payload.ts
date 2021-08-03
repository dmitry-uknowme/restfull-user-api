export class CreateUserPayload {
	readonly login: string;
	readonly password: string;
}

export class UpdateUserPayload {
	readonly login?: string;
	readonly password?: string;
	readonly roles?: string[];
}
