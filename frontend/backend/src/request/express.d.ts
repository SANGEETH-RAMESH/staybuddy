import { hostPayload, userPayload } from "../types/commonInterfaces/tokenInterface";

declare global {
  namespace Express {
    interface Request {
      user?: userPayload;
      customHost?: hostPayload; 
    }
  }
}
