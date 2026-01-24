import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="header">
        <h1>Equipes de Auditoria</h1>
        <button [routerLink]="['/teams/new']" class="btn btn-primary">Nova Equipe</button>
      </div>

      <div class="team-grid">
        <div *ngFor="let team of teamService.teams()" class="team-card">
          <div class="card-header">
            <h3>{{ team.title }}</h3>
            <div class="actions">
              <button [routerLink]="['/teams/edit', team.id]" class="btn-icon">✏️</button>
              <button (click)="teamService.deleteTeam(team.id)" class="btn-icon text-danger">🗑️</button>
            </div>
          </div>
          <div class="card-content">
            <p><strong>Membros:</strong> {{ team.members.length }}</p>
            <ul>
              <li *ngFor="let member of team.members.slice(0, 3)">
                {{ member.name }} ({{ member.email }})
              </li>
              <li *ngIf="team.members.length > 3">...e mais {{ team.members.length - 3 }}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div *ngIf="teamService.teams().length === 0" class="empty-state">
        <p>Nenhuma equipe cadastrada.</p>
      </div>
    </div>
  `,
  styles: `
    .container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .team-card { background: white; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    h3 { margin: 0; color: var(--primary-color); font-size: 1.25rem; }
    .card-content { font-size: 0.9rem; color: #475569; }
    ul { list-style: none; padding: 0; margin: 0.5rem 0 0; }
    li { padding: 0.25rem 0; font-size: 0.85rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-primary { background: var(--secondary-color); color: white; border: none; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; }
    .text-danger { color: #ef4444; }
    .empty-state { text-align: center; padding: 3rem; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; }
  `
})
export class TeamListComponent {
  teamService = inject(TeamService);
}
