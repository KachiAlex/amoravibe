import { Controller, Get, Query, Param, Patch, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Query('skip') skip = 0, @Query('take') take = 20, @Query('search') search?: string) {
    return this.adminService.getUsers(Number(skip), Number(take), search);
  }

  @Get('metrics')
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get('activity-log')
  getActivityLog() {
    return this.adminService.getActivityLog();
  }

  @Patch('users/:id/verify')
  verifyUser(@Param('id') id: string) {
    return this.adminService.verifyUser(id);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string, @Body('ban') ban: boolean) {
    return this.adminService.banUser(id, ban);
  }

  @Get('health')
  getHealth() {
    return this.adminService.getHealth();
  }
}
