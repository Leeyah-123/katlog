import { config } from '../../config';
import { User } from '../../core/types';

export class UserService {
  async getUser(token: string): Promise<User> {
    const response = await fetch(`${config.mainServerUrl}/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const user = await response.json();
    return user;
  }

  async getUserById(userId: string, token: string): Promise<User> {
    const response = await fetch(`${config.mainServerUrl}/api/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const user = await response.json();
    return user;
  }
}
