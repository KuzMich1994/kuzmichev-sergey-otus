import {dirCount, fileCount, resetCounters, tree} from './folders-tree';
import {vol} from 'memfs';
import * as treeModule from './folders-tree';

jest.mock('fs', () => require('memfs').fs);

describe('folders tree.', () => {
  const structure = {
    project: {
      'index.js': '',
      'package.json': '',
      src: {
        'main.ts': '',
        utils: {
          'helpers.js': '',
          date: {
            'date.js': '',
          }
        },
      },
      'README.md': '',
    },
  }


  beforeEach(() => {
    resetCounters();
    vol.reset();
  })

  test('should print correct structure and counts files/dirs', async () => {
    vol.fromNestedJSON(structure, '/');

    const logs: string[] = [];

    await tree('/project', Infinity, '', (line) => logs.push(line)).then(() => {
      logs.push(`${dirCount} directories, ${fileCount} files`);
    });

    expect(logs).toEqual([
      '├── src',
      '│   ├── utils',
      '│   │   ├── date',
      '│   │   │   └── date.js',
      '│   │   └── helpers.js',
      '│   └── main.ts',
      '├── README.md',
      '├── index.js',
      '└── package.json',
      '3 directories, 6 files'
    ]);

    expect(dirCount).toBe(3);
    expect(fileCount).toBe(6);
  });

  test('should print correct structure and counts files/dirs with depth limit', async () => {
    vol.fromNestedJSON(structure, '/');

    const logs: string[] = [];

    await tree('/project', 1, '', (line) => logs.push(line)).then(() => {
      logs.push(`${dirCount} directories, ${fileCount} files`);
    });

    expect(logs).toEqual([
      '├── src',
      '│   ├── utils',
      '│   └── main.ts',
      '├── README.md',
      '├── index.js',
      '└── package.json',
      '2 directories, 4 files'

    ]);

    expect(dirCount).toBe(2);
    expect(fileCount).toBe(4);
  })
});

describe('printFoldersTree', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});


  beforeEach(() => {
    jest.clearAllMocks();
    treeModule.resetCounters();
  });

  test('should be return error, when no path', async () => {
    await expect(treeModule.printProjectStructure(['ts-node', 'folders-tree.ts']))
      .rejects
      .toThrow('Ошибка: укажите путь к директории');
  });

  test('should be return error, when not correct depth', async () => {
    await expect(
      treeModule.printProjectStructure(['ts-node', 'folders-tree.ts', './', '--depth', 'abc'])
    ).rejects.toThrow('Ошибка: некорректное значение глубины');
  });

  test('show base count', async () => {
    await treeModule.printProjectStructure(['ts-node', 'folders-tree.ts', '/some/path']);

    expect(logSpy).toHaveBeenCalledWith('path');
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/directories, .* files/));
  });

});