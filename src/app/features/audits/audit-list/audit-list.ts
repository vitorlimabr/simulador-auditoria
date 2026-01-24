import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuditService } from '../../../core/services/audit.service';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './audit-list.html',
  styleUrl: './audit-list.scss',
})
export class AuditList {
  private auditService = inject(AuditService);
  protected audits = this.auditService.audits;
}
