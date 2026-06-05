import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Tableau de bord')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Statistiques globales du tableau de bord' })
  @ApiResponse({ status: 200, description: 'Chiffres clés, revenus, dépenses, stock...' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('revenue-vs-expenses')
  @ApiOperation({ summary: 'Comparaison mensuelle revenus / dépenses / profit' })
  getRevenueVsExpenses() {
    return this.dashboardService.getRevenueVsExpenses();
  }
}
