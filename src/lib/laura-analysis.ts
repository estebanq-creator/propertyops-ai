/**
 * Laura Analysis Pipeline - Document Integrity Analysis via Ollama
 * Phase 0B: Forensic-only analysis, no approval/denial recommendations
 */

export interface AnomalyFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
  location: string;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ANALYSIS_MODEL = process.env.LAURA_MODEL || 'qwen3.5:397b-cloud';

const SYSTEM_PROMPT = `You are Laura, a forensic document integrity analyst for PropertyOps AI.

Your ONLY job is to identify potential indicators of document manipulation or inconsistency.
You do NOT approve or deny applications. You do NOT assess creditworthiness or character.
You do NOT make housing recommendations.

Analyze the submitted document for:
1. Metadata inconsistencies (creation/modification dates, author, software producer)
2. Font or formatting anomalies (mixed typefaces suggesting copy-paste editing)
3. Logical inconsistencies (math errors in pay stubs, impossible date ranges, impossible balances)
4. Structural anomalies (missing standard fields, unusual layout for document type)
5. Employer/institution signals (known-invalid EIN formats, non-existent routing numbers, generic templates)

Output ONLY a JSON array of anomaly flags. Each flag must have:
- type: short snake_case identifier (e.g. "metadata_inconsistency", "font_variation", "logical_inconsistency")
- severity: "low" | "medium" | "high"
- evidence: specific factual description of what was observed
- location: where in the document this was found

If no anomalies are detected, return an empty array: []

IMPORTANT: Return ONLY the JSON array. No explanatory text before or after.`;

function buildUserPrompt(
  documentType: string,
  documentText: string,
  tenantName: string
): string {
  return `Document Type: ${documentType}
Applicant Name: ${tenantName}

Document Content:
---
${documentText.slice(0, 8000)}
---

Analyze this document for integrity anomalies. Return JSON array only.`;
}

export async function analyzeDocument(
  documentType: string,
  documentText: string,
  tenantName: string
): Promise<AnomalyFlag[]> {
  if (!documentText || documentText.trim().length < 20) {
    return [{
      type: 'insufficient_content',
      severity: 'low',
      evidence: 'Document text too short for automated analysis. Manual review required.',
      location: 'Full document',
    }];
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ANALYSIS_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(documentType, documentText, tenantName) },
      ],
      stream: false,
      options: { temperature: 0.1 },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawContent: string = data?.message?.content || data?.response || '';

  // Extract JSON array from response (handle thinking tags or preamble)
  const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('Laura: could not parse JSON from response:', rawContent.slice(0, 500));
    return [{
      type: 'analysis_parse_error',
      severity: 'low',
      evidence: 'Analysis model returned non-JSON response. Manual review required.',
      location: 'Full document',
    }];
  }

  try {
    const flags = JSON.parse(jsonMatch[0]) as AnomalyFlag[];
    // Validate and sanitize flags
    return flags
      .filter(f => f && typeof f.type === 'string')
      .map(f => ({
        type: String(f.type).slice(0, 80),
        severity: ['low', 'medium', 'high'].includes(f.severity) ? f.severity : 'low',
        evidence: String(f.evidence || '').slice(0, 500),
        location: String(f.location || 'Unknown').slice(0, 200),
      }));
  } catch {
    return [{
      type: 'analysis_parse_error',
      severity: 'low',
      evidence: 'Could not parse analysis output. Manual review required.',
      location: 'Full document',
    }];
  }
}
