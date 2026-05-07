// XML 解析测试辅助

export function wrapXmlTag(jsonContent: string): string {
  return `<写真系统状态>\n${jsonContent}\n</写真系统状态>`;
}

export function wrapXmlTagWithSurroundingText(jsonContent: string, prefix = '', suffix = ''): string {
  return `${prefix}<写真系统状态>\n${jsonContent}\n</写真系统状态>${suffix}`;
}

export function createInvalidXmlTag(): string {
  return '<写真系统状态>\n{invalid json\n</写真系统状态>';
}

export function createEmptyXmlTag(): string {
  return '<写真系统状态>\n</写真系统状态>';
}
