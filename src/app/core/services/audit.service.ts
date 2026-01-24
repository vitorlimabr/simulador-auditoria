import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Audit, Finding } from '../models/audit.model';
import { PersistenceService } from './persistence.service';

@Injectable({
    providedIn: 'root'
})
export class AuditService {
    private persistence = inject(PersistenceService);

    // Simulating a database with Signals
    private auditsSignal = signal<Audit[]>([]);
    private findingsSignal = signal<Finding[]>([]);

    constructor() {
        // Load initial data
        const savedData = this.persistence.loadData();
        if (savedData?.audits) {
            this.auditsSignal.set(savedData.audits.map((a: any) => ({
                ...a,
                teamId: a.id === '1' ? (a.teamId || '1') : a.teamId,
                startDate: new Date(a.startDate)
            })));
        } else {
            // Default mock if empty
            this.auditsSignal.set([
                {
                    id: '1',
                    code: 'AUD-2024-001',
                    teamId: '1', // Associando à equipe mock padrão
                    title: 'Auditoria de Conformidade na Merenda Escolar',
                    department: 'Secretaria de Educação',
                    startDate: new Date('2024-01-10'),
                    status: 'execucao',
                    riskLevel: 'alto',
                    auditorId: 'user-1',
                    objectives: [],
                    planningMatrix: [
                        {
                            question: 'A aquisição dos gêneros alimentícios seguiu os ditames da Lei 14.133/2021?',
                            informationRequired: 'Processos licitatórios, notas fiscais, contratos.',
                            sourceOfInformation: 'Sistema de Compras, Arquivo Morto',
                            procedure: 'Análise Documental',
                            procedureDetail: 'Verificar se houve pesquisa de preços e publicidade adequada.',
                            objects: 'Contrato 123/2023',
                            responsibleMember: 'João Silva',
                            period: '10/01 a 15/01',
                            possibleFindings: 'Sobrepreço, falta de publicidade.'
                        }
                    ],
                    risks: [
                        {
                            process: 'Aquisição de Alimentos',
                            reference: 'R1',
                            event: 'Compra de alimentos perecíveis em excesso',
                            causes: 'Falta de planejamento',
                            consequences: 'Desperdício',
                            probability: 'muito_alta',
                            inherentRiskLevel: 'extremo',
                            controlsIdentified: 'Nenhum controle formal identificado',
                            controlEffectiveness: 'fraco',
                            residualRiskLevel: 'critico',
                            relevance: 'Alto impacto financeiro e social',
                            viability: 'normal',
                            includeInMatrix: 'Sim',
                            auditQuestion: 'Os quantitativos adquiridos foram baseados em estudos técnicos de consumo?'
                        }
                    ]
                }
            ]);
        }

        if (savedData?.findings) {
            this.findingsSignal.set(savedData.findings);
        } else {
            this.findingsSignal.set([
                {
                    id: '1',
                    auditId: '1',
                    title: 'Alimentos vencidos no estoque',
                    description: 'Foram encontrados 50kg de arroz vencidos no depósito central.',
                    criteria: 'Resolução ANVISA RDC nº 216/2004',
                    condition: 'Produtos com data de validade expirada.',
                    objects: 'Depósito Central, Estoque de Arroz',
                    evidence: 'Fotos datadas de 10/01/2024 e relatório de inspeção.',
                    cause: 'Falha no controle PEPS (Primeiro que Entra, Primeiro que Sai).',
                    effect: 'Risco à saúde dos alunos e desperdício de recursos públicos.',
                    recommendation: 'Implementar controle rigoroso de validade e descartar lote vencido.',
                    severity: 'alta',
                    status: 'aberto'
                }
            ]);
        }

        // Effect to save whenever data changes (simple sync for now, TeamService handles its own or we can group)
        effect(() => {
            const currentData = this.persistence.loadData() || {};
            this.persistence.saveData({
                ...currentData,
                audits: this.auditsSignal(),
                findings: this.findingsSignal()
            });
        });
    }

    readonly audits = this.auditsSignal.asReadonly();

    readonly activeAuditsCount = computed(() =>
        this.auditsSignal().filter(a => a.status === 'execucao' || a.status === 'planejamento').length
    );

    readonly stats = computed(() => {
        const list = this.auditsSignal();
        return {
            total: list.length,
            highRisk: list.filter(a => a.riskLevel === 'alto').length,
            completed: list.filter(a => a.status === 'concluida').length
        };
    });

    addAudit(audit: Omit<Audit, 'id'>) {
        const newAudit: Audit = {
            ...audit,
            id: crypto.randomUUID()
        };
        this.auditsSignal.update(audits => [newAudit, ...audits]);
    }

    updateAudit(id: string, updatedData: Partial<Audit>) {
        this.auditsSignal.update(audits =>
            audits.map(a => a.id === id ? { ...a, ...updatedData } : a)
        );
    }

    getAuditById(id: string) {
        return computed(() => this.auditsSignal().find(a => a.id === id));
    }

    readonly findings = this.findingsSignal.asReadonly();

    getFindingsByAuditId(auditId: string) {
        return computed(() => this.findingsSignal().filter(f => f.auditId === auditId));
    }

    addFinding(finding: Omit<Finding, 'id'>) {
        const newFinding: Finding = {
            ...finding,
            id: crypto.randomUUID()
        };
        this.findingsSignal.update(findings => [...findings, newFinding]);
    }

    updateFinding(id: string, updatedFinding: Partial<Finding>) {
        this.findingsSignal.update(findings =>
            findings.map(f => f.id === id ? { ...f, ...updatedFinding } : f)
        );
    }

    // Export/Import bridge
    getAllData() {
        return {
            audits: this.auditsSignal(),
            findings: this.findingsSignal(),
            teams: this.persistence.loadData()?.teams || []
        };
    }

    importAllData(data: any) {
        if (data.audits) this.auditsSignal.set(data.audits);
        if (data.findings) this.findingsSignal.set(data.findings);
        // TeamService will handle teams if we inform it or if we just save to localstorage and reload
        this.persistence.saveData(data);
        window.location.reload(); // Simplest way to fresh all signals
    }
}
