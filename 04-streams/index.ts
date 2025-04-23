import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import {Transform, TransformCallback} from 'node:stream';
import {pipeline} from 'node:stream/promises';

interface ResultsObject {
  [key: string]: number;
}

const splitText = (text: string) => {
  if (!text || text.length === 0) return;
  const lines = text?.replace(/[^\w\s!?]/g, '').toLowerCase().split(/\r\n|\r|\n|\s/);

  return lines.filter((line) => line.length > 0);
};

const createIntermediateResult = (array: Array<string>) => {
  const wordCounts: ResultsObject = {};
  for (const line of array) {
    wordCounts[line] = (wordCounts[line] || 0) + 1;
  }

  return wordCounts;
};

const createIndexedArray = (intermediateResults: ResultsObject) => {
  const sortedData = Object.entries(intermediateResults).sort(([aKey], [bKey]) => aKey.localeCompare(bKey))

  return sortedData.map(([_, value]) => value);
};

const transformText = (text: string) => {
  const newText = splitText(text);
  const intermediateResults = createIntermediateResult(newText);

  return createIndexedArray(intermediateResults).join(',');
};

const writeToFile = async () => {
  const args = process.argv.slice(2);
  let buffer = '';

  if (args.length === 0) {
    console.error('Ошибка: укажите путь к директории');
    process.exit(1);
  }

  const filePath = args[0];
  const readableStream = fs.createReadStream(path.resolve(__dirname, filePath), {
    encoding: 'utf8',
    highWaterMark: 16,
  });
  const writeStream = fs.createWriteStream(path.resolve(__dirname, './array-vector.txt'), {
    encoding: 'utf8',
  });

  const transform = new Transform({
    objectMode: true,
    transform(chunk: ArrayBuffer, encoding: BufferEncoding, callback: TransformCallback) {
      buffer += chunk.toString();
      callback();
    },
    final(callback: (error?: (Error | null)) => void) {
      this.push(transformText(buffer));
      callback();
    }
  });

  try {
    await pipeline(readableStream, transform, writeStream);
  } catch (err) {
    console.log(`Pipeline failed: ${err}`);
  }
}

writeToFile();