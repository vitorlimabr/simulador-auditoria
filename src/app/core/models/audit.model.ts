export interface Audit {
    id: string;
    code: string;
    title: string;
    department: string;
    startDate: Date;
    status: 'planejamento' | 'execucao' | 'concluida';
    riskLevel: 'baixo' | 'medio' | 'alto';
    auditorId: string;
    teamId?: string; // Elo com a equipe
    objectives: string[];
    keyControls?: string; // Etapa 1: Controles-chave esperados
    planningMatrix?: PlanningMatrixItem[]; // Optional for backward compatibility or initial creation
    risks?: RiskItem[];
}

export interface AuditorMember {
    id: string;
    name: string;
    email: string;
}

export interface AuditTeam {
    id: string;
    title: string;
    members: AuditorMember[];
}

export interface PlanningMatrixItem {
    question: string; // Questões de Auditoria
    informationRequired: string; // Informações Requeridas
    sourceOfInformation: string; // Fontes de Informação
    procedure: string; // Procedimentos
    procedureDetail: string; // Detalhamento do Procedimento
    objects: string; // Objetos
    responsibleMember: string; // Membro Responsável
    period: string; // Período
    possibleFindings: string; // Possíveis Achados
    criteria?: string; // Mantendo opcional caso ainda seja usado em algum lugar legado
}

export interface RiskItem {
    id?: string;
    process: string; // Processo
    reference: string; // Ref
    event: string; // Descrição do evento
    causes: string; // Causas (mantido do CSV anterior, pode ser útil)
    consequences: string; // Consequências (mantido)

    // Análise de Risco Inerente
    probability: 'baixa' | 'media' | 'alta' | 'muito_alta';
    inherentRiskLevel: 'baixo' | 'medio' | 'alto' | 'extremo';

    // Controles
    controlsIdentified: string; // Controles Identificados

    // Avaliação das Respostas (Controles)
    controlEffectiveness: 'fraco' | 'satisfatorio' | 'forte';
    residualRiskLevel: 'baixo' | 'medio' | 'alto' | 'critico'; // Nível de Risco Residual

    // Critérios de Escopo
    relevance: string; // Relevância e Materialidade
    viability: 'normal' | 'dificil' | 'inviavel';

    // Decisão
    includeInMatrix: 'Sim' | 'Não'; // Incluir no escopo?

    // O ELO
    auditQuestion: string; // Questão de Auditoria
}

export interface Finding {
    id: string;
    auditId: string;
    title: string;
    description: string; // Situação Encontrada
    objects: string; // Objetos
    criteria: string;
    evidence: string; // Evidência
    cause: string;
    condition?: string; // O mesmo que description, mas as vezes separado
    effect: string;
    recommendation: string;
    severity: 'baixa' | 'media' | 'alta' | 'critica';
    status: 'aberto' | 'fechado';
}
