export interface AppError {
  code: string;
  message: string;
  cause?: unknown;
  context?: Record<string, unknown>;
}

export interface UnexpectedError extends AppError {
  code: "UNEXPECTED_ERROR";
}

export interface FileDoesNotExistError extends AppError {
  code: "FILE_DOES_NOT_EXIST";
  context: {
    invalidFilePath: string;
  };
}
