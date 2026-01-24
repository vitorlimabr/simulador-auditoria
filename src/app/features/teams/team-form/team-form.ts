import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEditMode() ? 'Editar Equipe' : 'Nova Equipe' }}</h1>
        <button [routerLink]="['/teams']" class="btn btn-outline">Voltar</button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-group">
          <label>Título da Equipe</label>
          <input formControlName="title" type="text" placeholder="Ex: Equipe de Controle Interno">
        </div>

        <div class="members-section">
          <div class="section-header">
            <h3>Auditores da Equipe</h3>
            <button type="button" (click)="addMember()" class="btn-text">+ Adicionar Auditor</button>
          </div>

          <div formArrayName="members">
            <div *ngFor="let member of members.controls; let i = index" [formGroupName]="i" class="member-row">
              <div class="form-group">
                <input formControlName="name" type="text" placeholder="Nome do Auditor">
              </div>
              <div class="form-group">
                <input formControlName="email" type="email" placeholder="E-mail">
              </div>
              <button type="button" (click)="removeMember(i)" class="btn-icon text-danger" [disabled]="members.length === 1">🗑️</button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Salvar Equipe</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .container { padding: 2rem; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .form-card { background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 1rem; flex: 1; }
    label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; color: #475569; }
    input { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.9rem; }
    .members-section { margin: 2rem 0; background: #f8fafc; padding: 1.5rem; border-radius: 6px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    h3 { margin: 0; font-size: 1rem; color: var(--primary-color); }
    .member-row { display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 0.75rem; }
    .btn { padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer; border: none; font-weight: 500; }
    .btn-primary { background: var(--secondary-color); color: white; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
    .btn-text { background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 0.9rem; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding-top: 0.5rem; }
    .text-danger { color: #ef4444; }
    .form-actions { margin-top: 2rem; display: flex; justify-content: flex-end; }
  `
})
export class TeamFormComponent {
  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  teamId = signal<string | null>(null);

  form = this.fb.group({
    title: ['', Validators.required],
    members: this.fb.array([], Validators.minLength(1))
  });

  get members() {
    return this.form.get('members') as FormArray;
  }

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.teamId.set(id);
        this.loadTeamData(id);
      } else {
        this.addMember();
      }
    });
  }

  addMember() {
    const memberGroup = this.fb.group({
      id: [Math.random().toString(36).substring(2, 9)],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.members.push(memberGroup);
  }

  removeMember(index: number) {
    if (this.members.length > 1) {
      this.members.removeAt(index);
    }
  }

  private loadTeamData(id: string) {
    const team = this.teamService.getTeamById(id)();
    if (team) {
      this.form.patchValue({ title: team.title });
      team.members.forEach(member => {
        this.members.push(this.fb.group({
          id: [member.id],
          name: [member.name, Validators.required],
          email: [member.email, [Validators.required, Validators.email]]
        }));
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const teamData = this.form.value as any;
      if (this.isEditMode() && this.teamId()) {
        this.teamService.updateTeam(this.teamId()!, teamData);
      } else {
        this.teamService.addTeam(teamData);
      }
      this.router.navigate(['/teams']);
    }
  }
}
