import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      // Cấu hình cho Passport JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Lấy JWT từ header: Authorization: Bearer <token>
      ignoreExpiration: false, //Token hết hạn sẽ bị từ chối
      // Sử dụng secret từ ConfigService hoặc giá trị mặc định
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key-nha-tro-2024',
      // Secret key để verify token
    });
  }

  async validate(payload: any) {
    // Được gọi khi token hợp lệ
    // Kiểm tra user vẫn tồn tại và active
    return this.authService.validateUser(payload);
  }
}
