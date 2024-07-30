import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './schemas/post.schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() request, @Body() createPostDto: PostEntity) {
    if (!createPostDto.content) {
      throw new BadRequestException('Post content is required');
    }

    const userId = request.user.userId;
    try {
      return await this.postsService.create(userId, createPostDto);
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid data format');
      }
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      return await this.postsService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    if (!id || id.length !== 24) {
      throw new BadRequestException('Invalid ID');
    }

    try {
      const post = await this.postsService.findOne(id);
      return post;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve post');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() request, @Param('id') id: string) {
    const userId = request.user.userId;

    try {
      const post = await this.postsService.findOne(id);
      if (post.author._id.toString() !== userId) {
        throw new ForbiddenException('Not allowed to delete this post');
      }

      await this.postsService.delete(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() request,
    @Param('id') id: string,
    @Body() updatePostDto: Partial<PostEntity>,
  ) {
    if (!updatePostDto || Object.keys(updatePostDto).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    const userId = request.user.userId;

    try {
      const post = await this.postsService.findOne(id);
      if (post.author._id.toString() !== userId) {
        throw new ForbiddenException('Not allowed to update this post');
      }

      return await this.postsService.update(id, updatePostDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid data format');
      }
      throw new InternalServerErrorException('Failed to update post');
    }
  }
}
