import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuditService } from '../../../core/services/audit.service';
import { TeamService } from '../../../core/services/team.service';
import { CommonModule } from '@angular/common';

interface HelpTexts {
  [key: string]: string;
}

@Component({
  selector: 'app-audit-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './audit-form.html',
  styleUrl: './audit-form.scss',
})
export class AuditForm {
  private fb = inject(FormBuilder);
  private auditService = inject(AuditService);
  protected teamService = inject(TeamService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  auditId = signal<string | null>(null);
  activeTab = signal<'geral' | 'planejamento' | 'riscos'>('geral');

  // Tooltip Texts
  helpTexts = {
    question: 'Apresentar, em forma de perguntas, os diferentes aspectos que compõem o escopo da fiscalização e que devem ser investigados com vistas à satisfação do objetivo.',
    informationRequired: 'Identificar as informações necessárias para responder a questão de auditoria.',
    sourceOfInformation: 'Identificar as fontes de cada item de informação requerida da coluna anterior. Estas fontes estão relacionadas com as técnicas empregadas.',
    procedure: 'Código ou enunciado do procedimento.',
    procedureDetail: 'Descrever as tarefas que serão realizadas, de forma clara, esclarecendo os aspectos a serem abordados (itens de verificação ou check list).',
    objects: 'Indicar o documento, o projeto, o programa, o processo, ou o sistema no qual o procedimento será aplicado. Exemplos: contrato, folha de pagamento, base de dados, ata, edital, ficha financeira, processo licitatório, orçamento.',
    responsibleMember: 'Pessoa(s) da equipe encarregada(s) da execução de cada procedimento.',
    period: 'Dia(s) em que o procedimento será executado.',
    possibleFindings: 'Esclarecer precisamente que conclusões ou resultados podem ser alcançados.',
    // Risk Help Texts
    process: 'Identificar o macroprocesso ou processo de trabalho.',
    event: 'Descrição do evento de risco (o que pode acontecer?).',
    inherentRisk: 'Risco avaliado antes de considerar os controles.',
    controls: 'Controles gerenciais já existentes.',
    effectiveness: 'O quão bem os controles funcionam (fraco/satisfatório/forte).',
    residualRisk: 'Risco que sobra após aplicação dos controles.',
    relevance: 'Importância e materialidade do risco.',
    viability: 'Viabilidade de auditar este risco.',
    includeInMatrix: 'Deve compor o escopo da auditoria?',
    auditQuestion: 'A Questão de Auditoria que será formulada para enfrentar este risco (O ELO com o Planejamento).'
  } as HelpTexts;

  form = this.fb.group({
    code: ['', Validators.required],
    title: ['', Validators.required],
    department: ['', Validators.required],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    riskLevel: ['medio', Validators.required],
    teamId: [''],
    keyControls: [''], // Etapa 1
    planningMatrix: this.fb.array([]),
    risks: this.fb.array([])
  });

  get planningMatrix() {
    return this.form.get('planningMatrix') as FormArray;
  }

  get risks() {
    return this.form.get('risks') as FormArray;
  }

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.auditId.set(id);
        this.loadAuditData(id);
      } else {
        this.addRiskRow(); // Start with Risk 
        this.addMatrixRow();
      }
    });
  }

  setActiveTab(tab: 'geral' | 'planejamento' | 'riscos') {
    if (tab === 'planejamento') {
      this.syncRisksToPlanning();
    }
    this.activeTab.set(tab);
  }

  // Sincroniza Riscos (Escopo = Sim) -> Matriz de Planejamento e Ordena
  private syncRisksToPlanning() {
    const rawRisks = this.risks.getRawValue();

    // 1. Reordenar Riscos: 'Sim' primeiro, depois 'Não'
    rawRisks.sort((a: any, b: any) => {
      if (a.includeInMatrix === 'Sim' && b.includeInMatrix === 'Não') return -1;
      if (a.includeInMatrix === 'Não' && b.includeInMatrix === 'Sim') return 1;
      return 0;
    });

    // 2. Repopular Riscos FormArray na nova ordem
    this.risks.clear();
    rawRisks.forEach((risk: any) => {
      this.risks.push(this.createRiskGroup(risk));
    });

    // 3. Sincronização Estrita: Risk #1 (Sim) -> Question #1
    const includedRisks = rawRisks.filter((r: any) => r.includeInMatrix === 'Sim');

    // Ajustar tamanho da matriz para ter PELO MENOS o número de riscos incluídos
    while (this.planningMatrix.length < includedRisks.length) {
      this.addMatrixRow();
    }

    // Atualizar as primeiras linhas com as questões dos riscos
    includedRisks.forEach((risk: any, index: number) => {
      const matrixRow = this.planningMatrix.at(index);
      if (matrixRow && risk.auditQuestion) {
        matrixRow.patchValue({
          question: risk.auditQuestion
        });
      }
    });
  }

  addMatrixRow() {
    this.planningMatrix.push(this.createMatrixGroup());
  }

  removeMatrixRow(index: number) {
    this.planningMatrix.removeAt(index);
  }

  addRiskRow() {
    this.risks.push(this.createRiskGroup());
  }

  removeRiskRow(index: number) {
    this.risks.removeAt(index);
  }

  // Helper: Create Matrix Group
  private createMatrixGroup(data?: any) {
    return this.fb.group({
      question: [data?.question || '', Validators.required],
      informationRequired: [data?.informationRequired || ''],
      sourceOfInformation: [data?.sourceOfInformation || ''],
      procedure: [data?.procedure || ''],
      procedureDetail: [data?.procedureDetail || ''],
      objects: [data?.objects || ''],
      responsibleMember: [data?.responsibleMember || ''],
      period: [data?.period || ''],
      possibleFindings: [data?.possibleFindings || '']
    });
  }

  // Helper: Create Risk Group
  private createRiskGroup(data?: any) {
    return this.fb.group({
      process: [data?.process || ''],
      reference: [data?.reference || ''],
      event: [data?.event || '', Validators.required],
      causes: [data?.causes || ''],
      consequences: [data?.consequences || ''],

      // Inherent
      probability: [data?.probability || 'alta'],
      inherentRiskLevel: [data?.inherentRiskLevel || 'alto'],

      // Controls
      controlsIdentified: [data?.controlsIdentified || ''],
      controlEffectiveness: [data?.controlEffectiveness || 'satisfatorio'],

      // Residual
      residualRiskLevel: [data?.residualRiskLevel || 'medio'],

      // Scope Decision
      relevance: [data?.relevance || ''],
      viability: [data?.viability || 'normal'],
      includeInMatrix: [data?.includeInMatrix || 'Sim'],
      auditQuestion: [data?.auditQuestion || '', Validators.required]
    });
  }

  private loadAuditData(id: string) {
    const auditSignal = this.auditService.getAuditById(id);
    const audit = auditSignal();

    if (audit) {
      this.form.patchValue({
        code: audit.code,
        title: audit.title,
        department: audit.department,
        startDate: new Date(audit.startDate).toISOString().split('T')[0],
        riskLevel: audit.riskLevel,
        teamId: audit.teamId || '',
        keyControls: audit.keyControls || ''
      });

      // Load Planning Matrix
      if (audit.planningMatrix) {
        audit.planningMatrix.forEach(item => {
          this.planningMatrix.push(this.createMatrixGroup(item));
        });
      }

      // Load Risks
      if (audit.risks) {
        audit.risks.forEach(item => {
          this.risks.push(this.createRiskGroup(item));
        });
      }

      if (this.planningMatrix.length === 0) this.addMatrixRow();
      if (this.risks.length === 0) this.addRiskRow();
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const auditData = {
        code: formValue.code!,
        title: formValue.title!,
        department: formValue.department!,
        startDate: new Date(formValue.startDate!),
        riskLevel: formValue.riskLevel as any,
        teamId: formValue.teamId || '',
        keyControls: formValue.keyControls || '',
        objectives: [],
        planningMatrix: formValue.planningMatrix as any[],
        risks: formValue.risks as any[]
      };

      if (this.isEditMode() && this.auditId()) {
        this.auditService.updateAudit(this.auditId()!, auditData);
      } else {
        this.auditService.addAudit({
          ...auditData,
          status: 'planejamento',
          auditorId: 'current-user'
        });
      }

      this.router.navigate(['/audits']);
    }
  }
}
