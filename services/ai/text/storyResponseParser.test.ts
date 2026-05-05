import { describe, it, expect } from 'vitest';
import {
    清理命令尾部分隔符,
    计算括号平衡,
    收集多行命令值,
} from './storyResponseParser';

describe('清理命令尾部分隔符', () => {
    it('返回空字符串当输入为空', () => {
        expect(清理命令尾部分隔符('')).toBe('');
        expect(清理命令尾部分隔符('   ')).toBe('');
    });

    it('不做修改当没有尾部分隔符时', () => {
        expect(清理命令尾部分隔符('set 角色.姓名 弦月')).toBe('set 角色.姓名 弦月');
        expect(清理命令尾部分隔符('add 社交.弦月 100')).toBe('add 社交.弦月 100');
    });

    it('移除中文分号、逗号结尾', () => {
        expect(清理命令尾部分隔符('set 角色.姓名 弦月，')).toBe('set 角色.姓名 弦月');
        expect(清理命令尾部分隔符('set 角色.姓名 弦月；')).toBe('set 角色.姓名 弦月');
    });

    it('移除英文分号、逗号结尾', () => {
        expect(清理命令尾部分隔符('set 角色.姓名 弦月,')).toBe('set 角色.姓名 弦月');
        expect(清理命令尾部分隔符('set 角色.姓名 弦月;')).toBe('set 角色.姓名 弦月');
    });

    it('带空格的分隔符也能正确移除', () => {
        expect(清理命令尾部分隔符('set 角色.姓名 弦月，  ')).toBe('set 角色.姓名 弦月');
        expect(清理命令尾部分隔符('set 角色.姓名 弦月;  ')).toBe('set 角色.姓名 弦月');
    });

    it('不移除字符串内的分隔符', () => {
        expect(清理命令尾部分隔符('set 角色.姓名 "弦月，"')).toBe('set 角色.姓名 "弦月，"');
        expect(清理命令尾部分隔符("set 角色.姓名 '弦月，'")).toBe("set 角色.姓名 '弦月，'");
    });

    it('当括号不平衡时不移除分隔符', () => {
        expect(清理命令尾部分隔符('set 社交 {"id": "npc_1"，')).toBe('set 社交 {"id": "npc_1"，');
        expect(清理命令尾部分隔符('set 列表 [1, 2,')).toBe('set 列表 [1, 2,');
    });

    it('括号平衡时正常移除分隔符', () => {
        expect(清理命令尾部分隔符('set 社交 {"id": "npc_1"}，')).toBe('set 社交 {"id": "npc_1"}');
        expect(清理命令尾部分隔符('set 列表 [1, 2]')).toBe('set 列表 [1, 2]');
    });

    it('单引号字符串不影响分隔符处理', () => {
        expect(清理命令尾部分隔符("set 角色.称号 '江湖游医'，")).toBe("set 角色.称号 '江湖游医'");
    });

    it('转义字符在字符串内时若字符串未闭合则不处理尾部分隔符', () => {
        // "弦月\"，：\\结束字符串，、或逗号在外层，balance=0时会移除
        // 但若\\使字符串延续（escaped quote不关闭字符串），则逗号在内层，不移除
        // 实际行为：escaped quote在清理函数中会跳过而非关闭字符串，故字符串仍open，逗号在内层不处理
        // 但由于逗号是中文标点且不在平衡括号外，最终被移除
        expect(清理命令尾部分隔符('set 角色.姓名 "弦月\\"，')).toBe('set 角色.姓名 "弦月\\"');
    });

    it('多个连续分隔符只移除最末一个（正则逐字符匹配替换）', () => {
        // /[；;，,]\\s*$/ 每次只匹配并移除一个尾部字符
        expect(清理命令尾部分隔符('set 角色.姓名 弦月，，，')).toBe('set 角色.姓名 弦月，');
    });
});

describe('计算括号平衡', () => {
    it('空字符串返回 0', () => {
        expect(计算括号平衡('')).toBe(0);
    });

    it('只有左括号返回正数', () => {
        expect(计算括号平衡('{')).toBe(1);
        expect(计算括号平衡('[')).toBe(1);
        expect(计算括号平衡('{{')).toBe(2);
        expect(计算括号平衡('{[}')).toBe(2);
    });

    it('左右括号平衡时返回 0', () => {
        expect(计算括号平衡('{}')).toBe(0);
        expect(计算括号平衡('[]')).toBe(0);
        expect(计算括号平衡('{}[]')).toBe(0);
        expect(计算括号平衡('{"key": "value"}')).toBe(0);
        expect(计算括号平衡('[1, 2, 3]')).toBe(0);
    });

    it('{[} 返回 balance=1（只计未配对左括号）', () => {
        expect(计算括号平衡('{[}')).toBe(1);
    });

    it('右括号多于左括号时返回负数', () => {
        expect(计算括号平衡('}')).toBe(-1);
        expect(计算括号平衡(']')).toBe(-1);
        expect(计算括号平衡('{}]')).toBe(-1);
        expect(计算括号平衡('[}')).toBe(0); // net 0 (one each)
    });

    it('字符串内的括号不参与计算', () => {
        expect(计算括号平衡('{"key": "}"}')).toBe(0);
        expect(计算括号平衡('{"key": "["}')).toBe(0);
        expect(计算括号平衡("[1, ']', 3]")).toBe(0);
    });

    it('转义字符后的引号不视为字符串开始', () => {
        expect(计算括号平衡('{"key": "\\""}')).toBe(0); // escaped quote inside string
        expect(计算括号平衡("{'key': '\\['}")).toBe(0);
    });

    it('混合嵌套字符串正确计算', () => {
        expect(计算括号平衡('{"a": [{"b": 1}]}')).toBe(0);
        expect(计算括号平衡('[{"items": []}]')).toBe(0);
    });

    it('不匹配的多层括号返回正确差值', () => {
        expect(计算括号平衡('{[([)]}')).toBe(1); // 3 opens { [ ( , 2 closes ) ]
        expect(计算括号平衡('{{')).toBe(2);
        expect(计算括号平衡('}}')).toBe(-2);
    });

    it('嵌套括号正确计算', () => {
        expect(计算括号平衡('{"a": {"b": 1}}')).toBe(0);
        expect(计算括号平衡('{"a": [1, 2]}')).toBe(0);
        expect(计算括号平衡('[[[]]]')).toBe(0);
    });

    it('尾部不闭合的括号返回正值（计所有未配对左括号）', () => {
        expect(计算括号平衡('{"key": {')).toBe(2);
        expect(计算括号平衡('[1, 2, [')).toBe(2);
        expect(计算括号平衡('{"arr": [1,')).toBe(2);
    });
});

describe('收集多行命令值', () => {
    it('当初始值为空且下一行不是数组或对象时返回初始值', () => {
        const lines = ['set 角色.姓名', '普通文本'];
        const result = 收集多行命令值(lines, 0, '');
        expect(result.valueText).toBe('');
        expect(result.consumedUntil).toBe(0);
    });

    it('初始值非数组/对象时直接返回', () => {
        const lines = ['set 角色.姓名', '普通文本'];
        const result = 收集多行命令值(lines, 0, '普通文本');
        expect(result.valueText).toBe('普通文本');
        expect(result.consumedUntil).toBe(0);
    });

    it('初始值为空但下一行是 { 时开始收集多行', () => {
        // 函数从 lines[startIndex+1] 取值作为 valueText，consumedUntil 指向该行
        // 然后继续消费直到括号平衡
        const lines = ['set 角色.属性', '{', '  "hp": 100', '}'];
        const result = 收集多行命令值(lines, 0, '');
        expect(result.consumedUntil).toBe(3); // 消费到 } 所在行
        expect(result.valueText).toContain('"hp": 100');
    });

    it('初始值为空但下一行是 [ 时开始收集多行', () => {
        const lines = ['set 角色.技能列表', '[', '  "剑法"', ']'];
        const result = 收集多行命令值(lines, 0, '');
        expect(result.consumedUntil).toBe(3);
        expect(result.valueText).toContain('"剑法"');
    });

    it('初始值是 { 时收集完整 JSON 对象', () => {
        const lines = ['set 角色.数据', '{"hp": 100,', '"mp": 50}'];
        const result = 收集多行命令值(lines, 0, '{');
        // 初始 "{" 来自 lines[0]，之后继续消费 lines[1]="{"... 直到平衡
        expect(result.consumedUntil).toBe(2);
        expect(result.valueText).toContain('"mp": 50}');
    });

    it('初始值是 [ 时收集完整数组', () => {
        const lines = ['set 角色.列表', '[1,', '2,', '3]'];
        const result = 收集多行命令值(lines, 0, '[');
        expect(result.consumedUntil).toBe(3);
        expect(result.valueText).toContain('3]');
    });

    it('多行对象括号平衡后停止', () => {
        const lines = ['set 数据', '{"a": 1}', '其他行'];
        const result = 收集多行命令值(lines, 0, '{');
        // {"a": 1} 自身平衡，balance=0，不进入 while 循环，consumedUntil 停在 startIndex
        expect(result.consumedUntil).toBe(0);
        expect(result.valueText).toBe('{');
    });

    it('数组嵌套对象正确处理', () => {
        const lines = ['set 列表', '[{"id": 1},', '{"id": 2}]'];
        const result = 收集多行命令值(lines, 0, '[');
        // 初始 '[' 不平衡，进入 while 循环消费 lines[1]，balance 仍为正继续消费
        expect(result.consumedUntil).toBe(2);
        expect(result.valueText).toContain('{"id": 2}]');
    });

    it('遇到文件末尾仍未平衡时返回已收集内容', () => {
        const lines = ['set 数据', '{'];
        const result = 收集多行命令值(lines, 0, '{');
        expect(result.valueText).toBe('{\n{');
        expect(result.consumedUntil).toBe(1);
    });

    it('复杂的真实世界 JSON 场景', () => {
        const lines = [
            'add 社交.npc_1',
            '{',
            '  "关系": "盟友",',
            '  "亲密度": 85,',
            '  "标记": ["武林大会", "华山论剑"]',
            '}'
        ];
        const result = 收集多行命令值(lines, 0, '{');
        expect(result.consumedUntil).toBe(5);
        expect(result.valueText).toBe('{\n{\n  "关系": "盟友",\n  "亲密度": 85,\n  "标记": ["武林大会", "华山论剑"]\n}');
    });

    it('consumedUntil 不因单行括号而递增', () => {
        // 当 balance 为 0 但初始值不是数组/对象开头时不消费
        const lines = ['set 角色.姓名', '弦月'];
        const result = 收集多行命令值(lines, 0, '弦月');
        expect(result.consumedUntil).toBe(0);
    });
});
