import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrivyUserPayload } from './interfaces/privy-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly http: AxiosInstance;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.http = axios.create({ baseURL: 'https://auth.privy.io/api/v1' });
  }

  async verifyPrivyToken(token: string): Promise<PrivyUserPayload> {
    const privySecret = this.configService.get<string>('PRIVY_SECRET_KEY');
    if (!privySecret) {
      throw new UnauthorizedException('PRIVY_SECRET_KEY missing');
    }

    try {
      const { data } = await this.http.post(
        '/verify',
        { token },
        { headers: { Authorization: `Bearer ${privySecret}` } },
      );
      const walletAddress =
        data?.user?.wallet?.address ?? data?.user?.walletAddress ?? data?.walletAddress;
      if (!walletAddress) {
        throw new UnauthorizedException('Privy payload missing wallet');
      }

      return {
        userId: data?.user?.id ?? data?.user_id ?? walletAddress,
        walletAddress,
        email: data?.user?.email,
        verifiedAt: data?.verified_at,
      };
    } catch (error) {
      throw new UnauthorizedException('Privy token verification failed');
    }
  }

  async loginWithPrivyToken(privyToken: string) {
    const privyPayload = await this.verifyPrivyToken(privyToken);
    return this.issueBackendToken(privyPayload);
  }

  async issueBackendToken(privyPayload: PrivyUserPayload) {
    const user = await this.usersService.upsertFromPrivy(privyPayload);
    const payload: JwtPayload = { userId: user.id, walletAddress: user.walletAddress };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      user,
    };
  }

  async validateUser(payload: JwtPayload) {
    return this.usersService.findById(payload.userId);
  }
}
