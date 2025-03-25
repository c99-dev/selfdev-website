import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/users.service";

// JWT 페이로드에 대한 인터페이스 정의
interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// 검증 후 반환될 사용자 정보 인터페이스
interface JwtValidatedUser {
  id: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    };

    super(options);
  }

  async validate(payload: JwtPayload): Promise<JwtValidatedUser> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
    };
  }
}
