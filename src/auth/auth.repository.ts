import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './auth.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async registerUser(registerDto: RegisterDto): Promise<User> {
    const { email, phone, name, password } = registerDto;

    const currentDate = moment().format();

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = this.create({
        email,
        phone,
        name,
        password: hashedPassword,
        created_at: currentDate,
        updated_at: currentDate,
      });

      const result = await this.save(user);

      return result;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('email or phone number already exist !!!');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
