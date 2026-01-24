import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuditService } from '../../core/services/audit.service';
import { TeamService } from '../../core/services/team.service';

@Component({
    selector: 'app-report-viewer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './report-viewer.html',
    styleUrl: './report-viewer.scss',
})
export class ReportViewer {
    private route = inject(ActivatedRoute);
    private auditService = inject(AuditService);
    private teamService = inject(TeamService);

    activeTab = signal<'programa' | 'riscos' | 'achados'>('programa');
    auditId = signal<string>('');

    audit = computed(() => {
        const id = this.auditId();
        return id ? this.auditService.getAuditById(id)() : undefined;
    });

    team = computed(() => {
        const auditData = this.audit();
        if (auditData?.teamId) {
            return this.teamService.getTeamById(auditData.teamId)();
        }
        return undefined;
    });

    findings = computed(() => {
        const id = this.auditId();
        return id ? this.auditService.getFindingsByAuditId(id)() : [];
    });

    constructor() {
        this.route.parent?.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) this.auditId.set(id);
        });

        // Also check current route if parent is not providing
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) this.auditId.set(id);
        });
    }

    setActiveTab(tab: 'programa' | 'riscos' | 'achados') {
        this.activeTab.set(tab);
    }

    printReport() {
        window.print();
    }
}
