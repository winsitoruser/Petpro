import { User as UserModel } from '../models/user.model';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
    
    interface Request {
      user?: User;
    }
  }
}