import { describe, expect, it } from 'vitest';
import { detectHabitability } from '../lib/tony-messages';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  id: string;
  category: string;
  label: string;
  message: string;
  expectedFlag: boolean;
  language: string;
}

function loadCorpus(): TestCase[] {
  const corpusPath = path.join(__dirname, 'tony-habitability-corpus.jsonl');
  const content = fs.readFileSync(corpusPath, 'utf-8');
  return content.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
}

describe('Tony habitability classifier - Full corpus evaluation', () => {
  const cases = loadCorpus();

  it.each(cases)('$id - $category - $label', ({ message, expectedFlag, label }) => {
    const result = detectHabitability(message);
    
    if (expectedFlag) {
      expect(result.isHabitability).toBe(true);
      if (label !== 'multiple' && label !== 'non-english') {
        // For non-english and multi-label cases, we just check flag, not specific match
        expect(result.matches.length).toBeGreaterThan(0);
      }
    } else {
      expect(result.isHabitability).toBe(false);
    }
  });

  it('should flag all clear habitability cases (1-10)', () => {
    const clearCases = cases.filter(c => c.category === 'clear-habitability');
    const failures = clearCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    expect(failures).toEqual([]);
  });

  it('should flag all multi-issue messages (21-25)', () => {
    const multiCases = cases.filter(c => c.category === 'multi-issue');
    const failures = multiCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    expect(failures).toEqual([]);
  });

  it('should flag all urgent language cases (41-45)', () => {
    const urgentCases = cases.filter(c => c.category === 'urgent-language');
    const failures = urgentCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    expect(failures).toEqual([]);
  });

  it('should have ≤1 false negative in ambiguous cases (11-15)', () => {
    const ambiguousCases = cases.filter(c => c.category === 'ambiguous' && c.expectedFlag);
    const failures = ambiguousCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    expect(failures.length).toBeLessThanOrEqual(1);
  });

  it('should have ≤1 false negative in edge cases (31-35)', () => {
    const edgeCases = cases.filter(c => c.category === 'edge-case' && c.expectedFlag);
    const failures = edgeCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    expect(failures.length).toBeLessThanOrEqual(1);
  });

  it('should have ≤1 false negative in partial descriptions (36-40)', () => {
    const partialCases = cases.filter(c => c.category === 'partial' && c.expectedFlag);
    const failures = partialCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    expect(failures.length).toBeLessThanOrEqual(1);
  });

  it('should have ≤1 false negative in typo/noise cases (48-50)', () => {
    const typoCases = cases.filter(c => c.category === 'typo-noise' && c.expectedFlag);
    const failures = typoCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    expect(failures.length).toBeLessThanOrEqual(1);
  });

  it('should have ≤2 false positives in cosmetic/preference cases (26-30)', () => {
    const falsePositiveCases = cases.filter(c => c.category === 'false-positive');
    const failures = falsePositiveCases.filter(c => detectHabitability(c.message).isHabitability);
    
    expect(failures.length).toBeLessThanOrEqual(2);
  });

  it('documents Spanish language gap (16-20) - expected failure', () => {
    const spanishCases = cases.filter(c => c.category === 'spanish');
    const failures = spanishCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    // This is expected to fail - English-only regex
    // Document as known gap for Phase 1
    console.log(`Spanish language gap: ${failures.length}/${spanishCases.length} cases not flagged (expected)`);
  });

  it('documents non-English gap (46-47) - expected failure', () => {
    const nonEnglishCases = cases.filter(c => c.category === 'non-english');
    const failures = nonEnglishCases.filter(c => !detectHabitability(c.message).isHabitability);
    
    // This is expected to fail - English-only regex
    console.log(`Non-English gap: ${failures.length}/${nonEnglishCases.length} cases not flagged (expected)`);
  });
});
