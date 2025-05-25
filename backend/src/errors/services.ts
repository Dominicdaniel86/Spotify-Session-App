export class AdminControlError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AdminControlError';
    }
}

export class InvalidParameterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidParameterError';
    }
}

export class InvalidPasswordError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidPasswordError';
    }
}

export class InternalServerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InternalServerError';
    }
}

export class ExistingSessionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExistingSessionError';
    }
}
