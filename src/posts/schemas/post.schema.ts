import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema()
export class Post extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  author: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
