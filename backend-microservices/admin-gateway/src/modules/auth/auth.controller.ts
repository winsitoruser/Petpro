import { Controller, Post, Body, Get, UseGuards, Request, Response } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CookieAuthGuard } from './guards/cookie-auth.guard';
import { Public } from './decorators/public.decorator';
import { Response as ExpressResponse } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Response() res: ExpressResponse) {
    const result = await this.authService.login(loginDto);
    
    // Set httpOnly cookies for admin
    res.cookie('admin_access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('admin_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh'
    });
    
    return res.json({
      user: result.user,
      message: 'Login successful'
    });
  }

  @ApiOperation({ summary: 'Admin logout' })
  @ApiCookieAuth()
  @UseGuards(CookieAuthGuard)
  @Post('logout')
  async logout(@Request() req: any, @Response() res: ExpressResponse) {
    const token = req.cookies?.admin_access_token || req.cookies?.admin_refresh_token;
    await this.authService.logout(token);
    
    // Clear cookies
    res.clearCookie('admin_access_token');
    res.clearCookie('admin_refresh_token', { path: '/auth/refresh' });
    
    return res.json({ message: 'Logout successful' });
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiCookieAuth()
  @UseGuards(CookieAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user; // User sudah di-inject dari guard
  }

  @ApiOperation({ summary: 'Refresh admin token' })
  @Public()
  @Post('refresh')
  async refreshToken(@Request() req: any, @Response() res: ExpressResponse) {
    const refreshToken = req.cookies?.admin_refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
    
    try {
      const result = await this.authService.refreshToken(refreshToken);
      
      // Set new cookies
      res.cookie('admin_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      if (result.refreshToken) {
        res.cookie('admin_refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/auth/refresh'
        });
      }
      
      return res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
      res.clearCookie('admin_access_token');
      res.clearCookie('admin_refresh_token', { path: '/auth/refresh' });
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  }
}