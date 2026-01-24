import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuditService } from './core/services/audit.service';
import { PersistenceService } from './core/services/persistence.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('audit-sim');
  private auditService = inject(AuditService);
  private persistence = inject(PersistenceService);

  exportData() {
    const data = this.auditService.getAllData();
    this.persistence.exportToJSON(data);
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        const data = await this.persistence.importFromJSON(file);
        this.auditService.importAllData(data);
      } catch (err) {
        alert('Erro ao importar arquivo: ' + err);
      }
    }
  }
}
