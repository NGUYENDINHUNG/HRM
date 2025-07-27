import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  age: number;
   @Prop()
  avatar: string;

  @Prop()
  gender: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  refreshToken: string;
  @Prop()
  deletedAt: Date;
  @Prop()
  isDeleted: Boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
