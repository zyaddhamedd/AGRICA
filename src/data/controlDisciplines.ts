export interface ControlDiscipline {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

export const CONTROL_DISCIPLINES: readonly ControlDiscipline[] = [
  { number: "01", title: "Sourcing", description: "Origin and programme selection." },
  { number: "02", title: "Quality control", description: "Inspection against agreed criteria." },
  { number: "03", title: "Traceability", description: "Lot identity across the journey." },
  { number: "04", title: "Packing", description: "Format aligned to buyer requirements." },
  { number: "05", title: "Storage", description: "Handling around product condition." },
  { number: "06", title: "IQF processing", description: "Controlled preparation for frozen lines." },
  { number: "07", title: "Certifications", description: "Documentation for programme needs." },
  { number: "08", title: "Sustainability", description: "Responsible choices across operations." },
] as const;
