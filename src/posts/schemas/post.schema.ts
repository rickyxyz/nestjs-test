import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Post extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  author: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
