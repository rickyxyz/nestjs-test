import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(userId: string, post: Post): Promise<Post> {
    const newPost = new this.postModel({
      ...post,
      author: new Types.ObjectId(userId),
    });
    return newPost.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().populate('author', 'username').exec();
  }

  async findOne(id: string): Promise<Post> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID format');
    }

    const post = await this.postModel
      .findById(id)
      .populate('author', 'username')
      .exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async delete(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID format');
    }

    return this.postModel.findByIdAndDelete(id).exec();
  }

  async update(id: string, updatePostDto: Partial<Post>): Promise<Post> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID format');
    }

    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return updatedPost.populate('author', 'username');
  }
}
