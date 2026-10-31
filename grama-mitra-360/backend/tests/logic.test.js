import test from 'node:test';
import assert from 'node:assert/strict';
process.env.JWT_SECRET = 'test-secret-test-secret';
const { evaluate } = await import('../services/eligibility.js');
const { trustFor } = await import('../services/trust.js');
const { looksLikeScam } = await import('../services/safety.js');
const rules = [
  { key: 'age', label: 'age', type: 'number', op: 'gte', value: 60 },
  { key: 'other', label: 'other', type: 'boolean', op: 'eq', value: false },
  { key: 'state', label: 'state', type: 'text', op: 'info' }];
test('eligibility: preliminary match', () => assert.equal(evaluate(rules, { age: 65, other: false, state: 'TS' }).result, 'preliminary_match'));
test('eligibility: not met', () => assert.equal(evaluate(rules, { age: 40, other: false, state: 'TS' }).result, 'may_not_be_eligible'));
test('eligibility: missing info', () => assert.equal(evaluate(rules, { age: 65 }).result, 'needs_more_info'));
test('trust: no record is LOW', () => assert.equal(trustFor(null).level, 'LOW'));
test('trust: unapproved source is LOW', () => assert.equal(trustFor({ source: { approved: false }, status: 'verified' }).level, 'LOW'));
test('trust: fresh verified is HIGH', () => assert.equal(trustFor({ source: { approved: true }, status: 'verified', lastVerified: new Date() }).level, 'HIGH'));
test('trust: stale verified is MEDIUM', () => assert.equal(trustFor({ source: { approved: true }, status: 'verified', lastVerified: new Date(Date.now() - 400 * 864e5) }).level, 'MEDIUM'));
test('trust: unverified approved is MEDIUM', () => assert.equal(trustFor({ source: { approved: true }, status: 'needs_verification' }).level, 'MEDIUM'));
test('scam keywords en/hi/te', () => { assert.ok(looksLikeScam('Someone asked for my OTP')); assert.ok(looksLikeScam('ओटीपी मांगा')); assert.ok(looksLikeScam('ఇది మోసమా')); assert.ok(!looksLikeScam('pension documents')); });
