import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuditService } from '../../../core/services/audit.service';
import { Audit, Finding } from '../../../core/models/audit.model';

@Component({
  selector: 'app-audit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './audit-detail.html',
  styleUrl: './audit-detail.scss',
})
export class AuditDetail {
  private route = inject(ActivatedRoute);
  private auditService = inject(AuditService);
  private fb = inject(FormBuilder);

  auditId = signal<string>('');
  editingFindingId = signal<string | null>(null);

  // Help Texts (same as before)
  helpTexts = {
    title: 'Deve ser preenchido o enunciado do achado, basicamente o título da irregularidade/impropriedade.',
    description: 'Situação existente, identificada, inclusive com o período de ocorrência, e documentada durante a fase de execução da auditoria.',
    objects: 'Indicar o documento, o projeto, o programa, o processo, ou o sistema no qual o achado foi constatado.',
    criteria: 'Legislação, norma, jurisprudência, entendimento doutrinário ou padrão adotado.',
    evidence: 'Informações obtidas durante a auditoria no intuito de documentar os achados e de respaldar as opiniões e conclusões da equipe.',
    cause: 'O que motivou a ocorrência do achado.',
    effect: 'Consequências ou possíveis consequências do achado. Deve ser atribuída a letra "P" ou a letra "R", conforme o efeito seja potencial ou real.',
    recommendation: 'Propostas da equipe de auditoria. Deve conter a identificação do(s) responsável(eis).'
  };

  // Computed signals
  audit = computed(() => {
    const id = this.auditId();
    return id ? this.auditService.getAuditById(id)() : undefined;
  });

  findings = computed(() => {
    const id = this.auditId();
    return id ? this.auditService.getFindingsByAuditId(id)() : [];
  });

  showFindingForm = signal(false);

  findingForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    severity: ['media', Validators.required],
    criteria: [''],
    objects: [''],
    evidence: [''],
    cause: [''],
    effect: [''],
    recommendation: ['']
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.auditId.set(params.get('id') || '');
    });
  }

  toggleFindingForm() {
    if (this.showFindingForm()) {
      this.resetForm();
      this.showFindingForm.set(false);
    } else {
      this.resetForm();
      this.showFindingForm.set(true);
    }
  }

  startEditFinding(finding: Finding) {
    this.editingFindingId.set(finding.id);
    this.findingForm.patchValue({
      title: finding.title,
      description: finding.description,
      severity: finding.severity,
      criteria: finding.criteria,
      objects: finding.objects || '',
      evidence: finding.evidence || '',
      cause: finding.cause,
      effect: finding.effect,
      recommendation: finding.recommendation
    });
    this.showFindingForm.set(true);
    // Scroll to form ideally, but standard behavior is fine for now
  }

  private resetForm() {
    this.editingFindingId.set(null);
    this.findingForm.reset({ severity: 'media' });
  }

  saveFinding() {
    if (this.findingForm.valid && this.auditId()) {
      const val = this.findingForm.value;
      const findingData = {
        title: val.title!,
        description: val.description!,
        severity: val.severity as any,
        criteria: val.criteria || '',
        objects: val.objects || '',
        evidence: val.evidence || '',
        cause: val.cause || '',
        effect: val.effect || '',
        recommendation: val.recommendation || '',
      };

      if (this.editingFindingId()) {
        // Update existing
        this.auditService.updateFinding(this.editingFindingId()!, findingData);
      } else {
        // Create new
        this.auditService.addFinding({
          ...findingData,
          auditId: this.auditId(),
          status: 'aberto'
        });
      }

      this.resetForm();
      this.showFindingForm.set(false);
    }
  }
}
