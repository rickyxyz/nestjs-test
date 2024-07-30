import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: User) {
    if (!createUserDto.username || !createUserDto.password) {
      throw new BadRequestException('Username and password are required');
    }

    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }
  a;
  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('username') username: string) {
    try {
      const user = await this.usersService.findOne(username);
      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
  ) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid user ID: ${id}`);
      }

      const requestingUserId = req.user.userId;
      if (requestingUserId !== id) {
        throw new ForbiddenException('Not allowed');
      }

      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req, @Param('id') id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid user ID: ${id}`);
      }

      const requestingUserId = req.user.userId;
      if (requestingUserId !== id) {
        throw new ForbiddenException('You can only delete your own account');
      }

      const user = await this.usersService.delete(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
