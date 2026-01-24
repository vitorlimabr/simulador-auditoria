import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuditService } from '../../core/services/audit.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private auditService = inject(AuditService);

  protected stats = this.auditService.stats;
  protected activeAuditsCount = this.auditService.activeAuditsCount;
  protected recentAudits = this.auditService.audits;
}
