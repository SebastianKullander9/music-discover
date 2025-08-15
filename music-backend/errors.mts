export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class validationError extends AppError {
    constructor(message : string) {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class SpotifyAPIError extends AppError {
    constructor(message: string, statusCode = 502) {
        super(message, statusCode);
    }
}

export class ListenbrainzAPIError extends AppError {
    constructor(message: string, statusCode = 502) {
        super(message, statusCode);
    }
}

export class LastFmError extends AppError {
    constructor(message: string, statusCode = 502) {
        super(message, statusCode);
    }
}