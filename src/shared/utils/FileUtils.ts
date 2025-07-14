import * as fs from 'fs';

const GetRelativePath = (): string => {
  const relativePath = process.cwd();
  return relativePath;
};

export const ReadFile = (relativePath: string, fileName: string): string => {
  const filePath = fs.readFileSync(
    GetRelativePath() + relativePath + fileName,
    'utf8',
  );
  return filePath;
};

export const TransformTo64 = (
  relativePath: string,
  fileName: string,
): string => {
  const filePath = relativePath + fileName;
  const base64 = fs
    .readFileSync(GetRelativePath() + filePath)
    .toString('base64');

  return `data:image/x-icon;base64,${base64}`;
};
