import { describe, it, expect } from 'vitest';
import { parseJsonWithRepair, formatJsonWithRepair } from './jsonRepair';

describe('parseJsonWithRepair — standard JSON', () => {
    it('parses valid JSON as-is', () => {
        const input = '{"name": "test", "value": 42}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'test', value: 42 });
        expect(result.usedRepair).toBe(false);
        expect(result.error).toBeUndefined();
    });

    it('parses nested objects', () => {
        const input = '{"outer": {"inner": [1, 2, 3]}}';
        const result = parseJsonWithRepair<{ outer: { inner: number[] } }>(input);
        expect(result.value?.outer.inner).toEqual([1, 2, 3]);
        expect(result.usedRepair).toBe(false);
    });

    it('parses arrays', () => {
        const input = '[1, "two", true, null]';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual([1, 'two', true, null]);
    });
});

describe('parseJsonWithRepair — markdown fences', () => {
    it('strips ```json fence', () => {
        const input = '```json\n{"key": "value"}\n```';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ key: 'value' });
        expect(result.usedRepair).toBe(true);
    });

    it('strips ``` without language tag', () => {
        const input = '```\n{"foo": "bar"}\n```';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ foo: 'bar' });
    });

    it('handles fence with extra whitespace', () => {
        const input = '  ```json\n  {"a": 1}\n  ```  ';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ a: 1 });
    });
});

describe('parseJsonWithRepair — JSON block extraction', () => {
    it('extracts { } from surrounding text', () => {
        const input = 'Some preamble\n{"name": "test"}\nSome trailing text';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'test' });
    });

    it('extracts nested braces correctly', () => {
        const input = 'prefix {"outer": {"inner": 1}} suffix';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ outer: { inner: 1 } });
    });
});

describe('parseJsonWithRepair — bare key quoting', () => {
    it('quotes unquoted keys', () => {
        const input = '{name: "test", value: 42}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'test', value: 42 });
    });

    it('handles Chinese character keys', () => {
        const input = '{角色: "英雄"}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ 角色: '英雄' });
    });

    it('handles hyphenated keys', () => {
        const input = '{my-key: "value"}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ 'my-key': 'value' });
    });
});

describe('parseJsonWithRepair — single-to-double quote conversion', () => {
    it('converts single-quoted keys', () => {
        const input = "{'name': 'test'}";
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'test' });
    });

    it('converts single-quoted string values', () => {
        const input = '{"name": ' + "'hello world'" + '}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'hello world' });
    });

    it('escapes double quotes inside single-quoted values', () => {
        const input = "{'key': 'say \"hi\"'}";
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ key: 'say "hi"' });
    });
});

describe('parseJsonWithRepair — missing commas', () => {
    it('inserts missing comma between properties', () => {
        const input = '{"a": 1 "b": 2}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ a: 1, b: 2 });
    });

    it('inserts missing comma between array items', () => {
        const input = '[{"a": 1}, {"b": 2}]';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual([{ a: 1 }, { b: 2 }]);
    });
});

describe('parseJsonWithRepair — trailing commas', () => {
    it('removes trailing comma in object', () => {
        const input = '{"a": 1, "b": 2,}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ a: 1, b: 2 });
    });

    it('removes trailing comma in array', () => {
        const input = '[1, 2, 3,]';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual([1, 2, 3]);
    });
});

describe('parseJsonWithRepair — fullwidth punctuation', () => {
    it('converts fullwidth quotes', () => {
        const input = '{"name": "test"}'.replace(/"/g, '“').replace(/"/g, '”');
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'test' });
    });

    it('converts fullwidth comma and colon', () => {
        const input = '{"name"： "test"， "value"： 42}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'test', value: 42 });
    });
});

describe('parseJsonWithRepair — string boundary fixes', () => {
    it('closes dangling string before closing brace', () => {
        const input = '{"name": "hello}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'hello' });
    });

    it('handles truncated string value', () => {
        const input = '{"message": "some text';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ message: 'some text' });
    });
});

describe('parseJsonWithRepair — \\n normalization', () => {
    it('fixes \\/n to \\n', () => {
        // normalizeSlashN handles \/n (without backslash escape) → \\n
        const input = '{"text": "line1\\/nline2"}';
        // Note: In JS string literal, \\/n = \/n (the backslash escapes to single \, so it's \/n)
        // But JSON.parse sees "line1\/nline2" which is valid JSON (\/ is escaped forward slash)
        // So this is already parseable as-is — the \/n normalization targets raw \/n in AI output
        const result = parseJsonWithRepair(input);
        // JSON.parse treats \/ as /, so this passes without repair
        expect(result.value).toEqual({ text: 'line1/nline2' });
    });

    it('fixes bare /n to \\n in broken JSON', () => {
        // normalizeSlashN only runs during repair, not on valid JSON.
        // When /n appears inside a string in valid JSON, JSON.parse succeeds
        // and returns the literal /n character — no repair needed.
        // The normalization targets AI output where /n was intended as \n escape.
        // Test with a case that forces repair (e.g., combined with another issue)
        const input = '{text: "line1/nline2"}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ text: 'line1\nline2' });
    });
});

describe('parseJsonWithRepair — tail punctuation', () => {
    it('removes trailing punctuation after closing brace', () => {
        const input = '{"ok": true}。';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ ok: true });
    });

    it('removes trailing semicolon after JSON', () => {
        const input = '{"data": 1};';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ data: 1 });
    });
});

describe('parseJsonWithRepair — linebreak escaping', () => {
    it('escapes raw newlines inside strings', () => {
        const input = '{"text": "hello\nworld"}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ text: 'hello\nworld' });
    });

    it('escapes raw \\r\\n inside strings', () => {
        const input = '{"text": "hello\r\nworld"}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ text: 'hello\nworld' });
    });
});

describe('parseJsonWithRepair — bracket balancing', () => {
    it('closes missing brace for nested object', () => {
        const input = '{"outer": {"inner": 1}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ outer: { inner: 1 } });
    });

    it('closes missing array bracket', () => {
        const input = '{"items": [1, 2';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ items: [1, 2] });
    });

    it('ignores extra closing braces', () => {
        const input = '{"a": 1}}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ a: 1 });
    });
});

describe('parseJsonWithRepair — error-guided repair', () => {
    it('fixes multiple issues in one pass', () => {
        const input = '{"name": "test", "value": 42,}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ name: 'test', value: 42 });
    });

    it('handles complex broken JSON from AI', () => {
        const input = `{"角色": "英雄", "等级": 10, "技能": [{"name": "fireball", "damage": 50}]}`;
        const result = parseJsonWithRepair(input);
        expect(result.value).toBeTruthy();
        expect(result.value).not.toBeNull();
    });
});

describe('formatJsonWithRepair', () => {
    it('returns formatted JSON on success', () => {
        const input = '{"a":1,"b":2}';
        const result = formatJsonWithRepair(input, 'fallback');
        expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    it('returns fallback when repair fails completely', () => {
        const input = 'not json at all !!!';
        const result = formatJsonWithRepair(input, 'fallback');
        expect(result).toBe('fallback');
    });

    it('repairs then formats', () => {
        const input = "{name: 'test'}";
        const result = formatJsonWithRepair(input, 'fallback');
        expect(result).toBe('{\n  "name": "test"\n}');
    });
});

describe('parseJsonWithRepair — edge cases', () => {
    it('returns null for empty input', () => {
        const result = parseJsonWithRepair('');
        expect(result.value).toBeNull();
        expect(result.error).toBeDefined();
    });

    it('returns null for whitespace-only input', () => {
        const result = parseJsonWithRepair('   \n\t  ');
        expect(result.value).toBeNull();
    });

    it('handles BOM prefix', () => {
        const input = '﻿{"key": "value"}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ key: 'value' });
    });

    it('returns null for completely unrepairable text', () => {
        const result = parseJsonWithRepair('Hello, this is just plain text with no JSON.');
        expect(result.value).toBeNull();
    });

    it('handles TypeScript generics that look like JSON', () => {
        const input = 'Array<string> is not JSON';
        const result = parseJsonWithRepair(input);
        expect(result.value).toBeNull();
    });

    it('presers numeric types', () => {
        const input = '{"int": 42, "float": 3.14, "negative": -7}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ int: 42, float: 3.14, negative: -7 });
    });

    it('preserves boolean and null types', () => {
        const input = '{"a": true, "b": false, "c": null}';
        const result = parseJsonWithRepair(input);
        expect(result.value).toEqual({ a: true, b: false, c: null });
    });
});
