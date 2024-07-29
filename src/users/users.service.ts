import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(user: User): Promise<User> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(username: string): Promise<User> {
    return this.userModel.findOne({ username }).exec();
  }

  async update(userId: string, updateUserDto: Partial<User>): Promise<User> {
    const userIdObject = new Types.ObjectId(userId);
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userIdObject, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return updatedUser;
  }

  async delete(id: string): Promise<any> {
    const userIdObject = new Types.ObjectId(id);
    return this.userModel.findByIdAndDelete(userIdObject).exec();
  }
}
