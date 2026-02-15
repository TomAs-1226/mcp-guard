import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function writeJsonReport<T>(report: T, outDir: string, fileName = 'report.json'): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const output = join(outDir, fileName);
  await writeFile(output, JSON.stringify(report, null, 2), 'utf8');
  return output;
}
