import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runEasterEggCommand } from '../src/components/terminalEasterEggs.ts';

test('fetch aliases show the requested specs and a custom logo', () => {
  const result = runEasterEggCommand('neofetch');
  assert.deepEqual(runEasterEggCommand('  FASTFETCH  '), result);
  for (const spec of ['OS: DebajitOS v1.0 x86_64', 'Host: RCCIIT CSE Lab', 'Kernel: React.js / Next.js', 'Uptime: 3 cups of coffee', 'Shell: BTech_Student_v2026']) {
    assert.ok(result.text.includes(spec));
  }
  assert.ok(result.art.includes('DEBAJIT'));
});

test('cowsay preserves quoted case, spaces, escaped quotes, and literal pipes', () => {
  assert.equal(runEasterEggCommand('cowsay "Hire Me"').announcement, 'A cow says: Hire Me');
  assert.equal(runEasterEggCommand("cowsay 'hello | world'").announcement, 'A cow says: hello | world');
  assert.equal(runEasterEggCommand('cowsay "say \\"hi\\""').announcement, 'A cow says: say "hi"');
  const long = runEasterEggCommand(`cowsay "${'x'.repeat(100)}"`);
  assert.ok(long.preformatted);
  assert.ok(long.text.split('\n').every((line) => line.length <= 32));
});

test('fortune piping produces a cow; invalid pipes and quotes do not start effects', () => {
  const piped = runEasterEggCommand('fortune|cowsay');
  assert.ok(piped.preformatted && piped.announcement.startsWith('A cow says: '));
  assert.ok(piped.text.includes('^__^'));
  for (const invalid of ['fortune | matrix', 'fortune | cowsay | sl', 'cowsay "oops', 'sudo rm -rf / | matrix']) {
    const result = runEasterEggCommand(invalid);
    assert.equal(result.error, true);
    assert.equal(result.effect, undefined);
  }
});

test('only the supported fake removal invocation triggers panic', () => {
  assert.equal(runEasterEggCommand('sudo   rm -rf /').effect, 'panic');
  assert.equal(runEasterEggCommand('sudo rm -rf / --no-preserve-root').effect, 'panic');
  for (const invalid of ['sudo rm -rf /home', 'sudo rm -rf /; matrix', 'sudo rm -rf / extra']) {
    assert.equal(runEasterEggCommand(invalid).effect, undefined);
  }
  assert.equal(runEasterEggCommand('about'), null);
  assert.equal(runEasterEggCommand('matrix extra').error, true);
});
