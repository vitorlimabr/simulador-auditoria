import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AuditTeam, AuditorMember } from '../models/audit.model';
import { PersistenceService } from './persistence.service';

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private persistence = inject(PersistenceService);
    private teamsSignal = signal<AuditTeam[]>([]);

    constructor() {
        const savedData = this.persistence.loadData();
        if (savedData?.teams) {
            this.teamsSignal.set(savedData.teams);
        } else {
            this.teamsSignal.set([
                {
                    id: '1',
                    title: 'Equipe de Finanças',
                    members: [
                        { id: '101', name: 'João Silva', email: 'joao.silva@audit.gov' },
                        { id: '102', name: 'Maria Souza', email: 'maria.souza@audit.gov' }
                    ]
                }
            ]);
        }

        effect(() => {
            const currentData = this.persistence.loadData() || {};
            this.persistence.saveData({
                ...currentData,
                teams: this.teamsSignal()
            });
        });
    }

    teams = computed(() => this.teamsSignal());

    getTeamById(id: string) {
        return computed(() => this.teamsSignal().find(t => t.id === id));
    }

    addTeam(team: Omit<AuditTeam, 'id'>) {
        const newTeam = {
            ...team,
            id: Math.random().toString(36).substring(2, 9)
        };
        this.teamsSignal.update(teams => [...teams, newTeam]);
        return newTeam;
    }

    updateTeam(id: string, teamData: Partial<AuditTeam>) {
        this.teamsSignal.update(teams =>
            teams.map(t => t.id === id ? { ...t, ...teamData } : t)
        );
    }

    deleteTeam(id: string) {
        this.teamsSignal.update(teams => teams.filter(t => t.id !== id));
    }
}
