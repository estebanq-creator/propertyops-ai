import { describe, expect, it } from 'vitest';
import { detectHabitability } from '../lib/tony-messages';
import { scanForMissedHabitabilityFlags } from '../lib/failure-monitoring';

describe('Tony habitability classifier', () => {
  const requiredCases = [
    {
      label: 'no heat / heating failure',
      message: 'There is no heat in the apartment and the furnace stopped working last night.',
    },
    {
      label: 'no water / plumbing failure',
      message: 'We have no hot water and the plumbing is backing up into the tub.',
    },
    {
      label: 'electrical hazard',
      message: 'The outlet is sparking and there is exposed wiring by the bedroom wall.',
    },
    {
      label: 'gas leak / gas odor',
      message: 'There is a gas smell in the kitchen and it smells like rotten eggs.',
    },
    {
      label: 'structural damage',
      message: 'The ceiling is collapsing and there is structural damage over the bathroom.',
    },
    {
      label: 'pest infestation',
      message: 'We have mice and a roach infestation in the pantry.',
    },
    {
      label: 'mold / mildew',
      message: 'There is black mold growing behind the bedroom dresser.',
    },
    {
      label: 'security breach',
      message: 'The front door lock is broken and the window will not lock.',
    },
    {
      label: 'health / safety hazard',
      message: 'This is an unsafe emergency and the unit is becoming uninhabitable.',
    },
  ] as const;

  it.each(requiredCases)('flags $label', ({ label, message }) => {
    const result = detectHabitability(message);

    expect(result.isHabitability).toBe(true);
    expect(result.matches).toContain(label);
  });

  it('does not flag a normal non-habitability maintenance draft', () => {
    const result = detectHabitability('Please repaint the bedroom wall and replace a loose cabinet handle.');

    expect(result.isHabitability).toBe(false);
    expect(result.matches).toEqual([]);
  });
});

describe('Habitability false-negative watchdog', () => {
  it('raises an alert when a dangerous message was not flagged', () => {
    const alert = scanForMissedHabitabilityFlags({
      messageId: 'msg-123',
      content: 'There is no heat and I also smell gas in the hallway.',
      wasFlagged: false,
      userId: 'tenant-1',
    });

    expect(alert).not.toBeNull();
    expect(alert?.category).toBe('HABITABILITY_FALSE_NEGATIVE');
    expect(alert?.metadata?.missedKeywords).toEqual(
      expect.arrayContaining(['no heat / heating failure', 'gas leak / gas odor'])
    );
  });

  it('does not raise an alert when the message was already flagged', () => {
    const alert = scanForMissedHabitabilityFlags({
      messageId: 'msg-124',
      content: 'The outlet is sparking and there is exposed wiring.',
      wasFlagged: true,
      userId: 'tenant-2',
    });

    expect(alert).toBeNull();
  });
});
