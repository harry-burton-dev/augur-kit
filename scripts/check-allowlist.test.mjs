import assert from 'node:assert/strict';
import { test } from 'node:test';
import { narrowed, takenAway } from './check-allowlist.mjs';

const list = (elements) => ({ schema: 'augur.quill-remote/v1', elements });
const button = { part: 'Button', properties: { label: 'string', kind: { enum: ['primary', 'ghost'] } }, events: { press: 'nothing' } };

test('an allowlist that only adds takes nothing away', () => {
  const before = list({ 'quill-button': button });
  const after = list({
    'quill-button': { ...button, properties: { ...button.properties, icon: 'icon', kind: { enum: ['primary', 'ghost', 'danger'] } }, events: { ...button.events, hover: 'nothing' }, slots: ['end'] },
    'quill-tag': { part: 'Tag', properties: {}, events: {} },
  });
  assert.deepEqual(takenAway(before, after), []);
});

test('a removed element, property, event, slot, mirror or child kind, or a changed event detail, is taken away', () => {
  const field = { part: 'TextField', properties: { value: 'string' }, events: { change: 'the text' }, mirror: { change: 'value' }, slots: ['help'], children: 'elements' };
  const before = list({ 'quill-button': button, 'quill-text-field': field, 'quill-tag': { part: 'Tag', properties: {}, events: {} } });
  const after = list({
    'quill-button': { ...button, properties: { kind: button.properties.kind }, events: {} },
    'quill-text-field': { ...field, mirror: {}, slots: [], children: undefined },
  });
  assert.deepEqual(takenAway(before, after), [
    '<quill-button>’s property “label” was removed',
    '<quill-button>’s event “press” was removed',
    '<quill-text-field> no longer mirrors “change” into “value”',
    '<quill-text-field>’s slot “help” was removed',
    '<quill-text-field> took elements as children, now none',
    '<quill-tag> was removed',
  ]);
  assert.deepEqual(takenAway(list({ 'quill-button': button }), list({ 'quill-button': { ...button, events: { press: 'the time' } } })), [
    '<quill-button>’s event “press” carried “nothing”, now “the time”',
  ]);
  assert.deepEqual(takenAway(before, { ...before, schema: 'augur.quill-remote/v2' }), ['the schema was augur.quill-remote/v1, now augur.quill-remote/v2']);
});

test('the kit part an element draws with is the host’s own choice', () => {
  assert.deepEqual(takenAway(list({ 'quill-button': button }), list({ 'quill-button': { ...button, part: 'KeyButton' } })), []);
});

test('a value set that loses a value narrows', () => {
  assert.deepEqual(narrowed('k', { enum: ['a', 'b', 'c'] }, { enum: ['a'] }), ['k no longer takes “b”, “c”']);
  assert.deepEqual(narrowed('k', { enum: ['a'] }, { enum: ['a', 'b'] }), []);
});

test('a primitive widens to string or scalar, and narrows any other way', () => {
  assert.deepEqual(narrowed('k', 'icon', 'string'), []);
  assert.deepEqual(narrowed('k', { enum: ['a'] }, 'string'), []);
  assert.deepEqual(narrowed('k', 'number', 'scalar'), []);
  assert.deepEqual(narrowed('k', 'icon', 'scalar'), []);
  assert.deepEqual(narrowed('k', 'string', 'icon'), ['k took "string", now "icon"']);
  assert.deepEqual(narrowed('k', 'string', { enum: ['a'] }), ['k took "string", now {"enum":["a"]}']);
  assert.deepEqual(narrowed('k', 'scalar', 'string'), ['k took "scalar", now "string"']);
  assert.deepEqual(narrowed('k', 'string', { array: 'string' }), ['k took "string", now {"array":"string"}']);
});

test('one of several shapes takes each shape it took before', () => {
  assert.deepEqual(narrowed('k', 'string', { oneOf: ['string', 'number'] }), []);
  assert.deepEqual(narrowed('k', { oneOf: ['string', 'number'] }, { oneOf: ['number', 'string', 'boolean'] }), []);
  assert.deepEqual(narrowed('k', { oneOf: ['string', 'number'] }, 'string'), ['k took "number", now "string"']);
});

test('a list, a pair, an object and a record narrow through what they hold', () => {
  assert.deepEqual(narrowed('k', { array: { enum: ['a', 'b'] } }, { array: { enum: ['a'] } }), ['k[] no longer takes “b”']);
  assert.deepEqual(narrowed('k', { tuple: ['string', 'string'] }, { tuple: ['string'] }), ['k took 2 values, now 1']);
  assert.deepEqual(narrowed('k', { tuple: ['string', 'icon'] }, { tuple: ['string', 'string'] }), []);
  const item = { object: { id: 'string', label: 'string' }, required: ['id'] };
  assert.deepEqual(narrowed('k', item, { object: { ...item.object, detail: 'string' }, required: ['id'] }), []);
  assert.deepEqual(narrowed('k', item, { object: { id: 'string', label: 'number' }, required: ['id', 'label'] }), ['k.label took "string", now "number"', 'k.label is now required']);
  assert.deepEqual(narrowed('k', item, { object: { id: 'string' }, required: ['id'] }), ['k.label was removed']);
  const row = { record: 'scalar', required: { id: 'string' } };
  assert.deepEqual(narrowed('k', row, { record: 'scalar' }), []);
  assert.deepEqual(narrowed('k', row, { record: 'string', required: { id: 'string', at: 'number' } }), ['k.* took "scalar", now "string"', 'k.at is now required']);
});
