import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(userID: string, post: Post): Promise<Post> {
    const newPost = new this.postModel({ author: userID, ...post });
    return newPost.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().exec();
  }

  async findOne(id: string): Promise<Post> {
    return this.postModel.findById(id).exec();
  }

  async delete(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID format');
    }

    const postIdObject = new Types.ObjectId(id);
    return this.postModel.findByIdAndDelete(postIdObject).exec();
  }

  async update(id: string, updatePostDto: Partial<Post>): Promise<Post> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID format');
    }

    const postIdObject = new Types.ObjectId(id);
    const updatedPost = await this.postModel
      .findByIdAndUpdate(postIdObject, updatePostDto, { new: true })
      .exec();

    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return updatedPost;
  }
}
