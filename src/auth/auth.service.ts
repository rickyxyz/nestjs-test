import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: { username: string; password: string }) {
    const user = await this.usersService.findOne(loginDto.username);
    if (!user || user.password !== loginDto.password) {
      throw new Error('Invalid credentials');
    }

    const payload = { sub: user._id, username: user.username };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
