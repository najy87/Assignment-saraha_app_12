export class ConflictException extends Error {
  constructor(massege) {
    super(massege, { cause: 409 });
  }
}

export class NotFoundException extends Error {
  constructor(massege) {
    super(massege, { cause: 404 });
  }
}

export class UnauthoreizedException extends Error {
  constructor(massege) {
    super(massege, { cause: 401 });
  }
}

export class BadRequestException extends Error {
  constructor(massege, details = []) {
    super(massege, { cause: 400 });
    this.details = details;
  }
}
