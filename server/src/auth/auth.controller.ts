import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from "@nestjs/common";
import { AuthService, AuthResponse } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";

// Request에 user 객체를 포함하는 인터페이스 정의
interface RequestWithUser extends Request {
  user: User;
}

// JWT 인증 후 요청에 포함될 사용자 정보 인터페이스
interface JwtRequestUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.authService.registerUser(
      createUserDto.email,
      createUserDto.password,
      createUserDto.name,
    );
    return this.authService.login(user);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req: RequestWithUser): Promise<AuthResponse> {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req: JwtRequestUser) {
    return req.user;
  }
}
