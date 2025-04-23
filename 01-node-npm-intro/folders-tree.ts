import fs from 'fs';
import path from 'path';

export let dirCount = 0;
export let fileCount = 0;

export const resetCounters = () => {
  fileCount = 0;
  dirCount = 0;
};

export const tree = async (
  dirPath: string,
  depth = Infinity,
  prefix = '',
  log: (line: string) => void = console.log,
): Promise<string> => {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return;
  }

  if (depth < 0) {
    return;
  }

  let items: fs.Dirent[];

  try {
    items = await fs.promises.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    console.error(`Ошибка: не удалось прочитать директорию ${dirPath}`);
    return;
  }

  const dirs = items.filter((item) => item.isDirectory());
  const files = items.filter((item) => item.isFile());

  const allItems = [...dirs, ...files];

  for (let index = 0; index < allItems.length; index++) {
    const item = allItems[index];
    const isLast = index === allItems.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    log(prefix + connector + item.name);
    if (item.isFile()) {
      fileCount += 1;
    }

    if (item.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      dirCount += 1;
      await tree(path.join(dirPath, item.name), depth - 1, newPrefix, log);
    }
  }
}

export const printProjectStructure = async (argv?: string[]) => {
  const args = argv ? argv.slice(2) : process.argv.slice(2);

  if (args.length === 0) {
    throw new Error('Ошибка: укажите путь к директории');
  }

  const dirPath = args[0];
  let depth = Infinity;
  const depthIndex = args.findIndex((arg) => arg === '--depth' || arg === '-d');

  if (depthIndex !== -1 && args[depthIndex + 1]) {
    depth = parseInt(args[depthIndex + 1]);

    if (isNaN(depth) || depth < 0) {
     throw new Error('Ошибка: некорректное значение глубины');
    }
  }

  console.log(path.basename(dirPath));
  await tree(dirPath, depth).then(() => console.log(`${dirCount} directories, ${fileCount} files`));
}

if (require.main === module) {
  printProjectStructure(process.argv).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
