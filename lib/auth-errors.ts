// Map Cognito SDK errors to safe, friendly messages + HTTP status codes.
// Deliberately generic on login to avoid user-enumeration.
export function mapCognitoError(e: unknown): {
  status: number;
  message: string;
} {
  const name =
    (e as { name?: string })?.name ||
    (e as { __type?: string })?.__type ||
    "";

  switch (name) {
    case "UsernameExistsException":
      return { status: 409, message: "An account with that email already exists." };
    case "InvalidPasswordException":
    case "InvalidParameterException":
      return {
        status: 400,
        message: "Password does not meet the requirements (min 8 chars, upper, lower, number).",
      };
    case "CodeMismatchException":
      return { status: 400, message: "Invalid confirmation code." };
    case "ExpiredCodeException":
      return { status: 400, message: "Confirmation code has expired. Request a new one." };
    case "UserNotConfirmedException":
      return { status: 403, message: "Please confirm your email before signing in." };
    case "NotAuthorizedException":
    case "UserNotFoundException":
      // Same message for both → no user-enumeration.
      return { status: 401, message: "Incorrect email or password." };
    case "TooManyRequestsException":
    case "LimitExceededException":
      return { status: 429, message: "Too many attempts. Please try again shortly." };
    default:
      return { status: 500, message: "Something went wrong. Please try again." };
  }
}
