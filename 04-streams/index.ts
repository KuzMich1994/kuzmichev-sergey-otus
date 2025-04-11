import fs from 'node:fs';
import path from 'node:path';
import {Transform, TransformCallback, Writable} from 'node:stream';
import * as process from 'node:process';

interface ResultsObject {
  [key: string]: number;
}

const wordCounts: ResultsObject = {};

const splitText = (text: string) => {
  if (!text || text.length === 0) return;
  const lines = text?.replace(/[^\w\s!?]/g, '').split(/\r\n|\r|\n|\s/);

  return lines.filter((line) => line.length > 0);
}

const objectToSortedString = (intermediateData: ResultsObject) => {
  const sortedData = Object.entries(intermediateData).sort(([aKey], [bKey]) => aKey.localeCompare(bKey))

  return sortedData.map(([_, value]) => value);
}

const textSplitter = new Transform({
  readableObjectMode: true,
  transform(chunk: ArrayBuffer, encoding: BufferEncoding, callback: TransformCallback) {
    this.push(splitText(chunk.toString()));

    callback();
  }
});

const frequencyCollector = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  final(callback: TransformCallback) {
    const vector = objectToSortedString(wordCounts);

    this.push(vector.join(','))
  },
  async transform(chunk: Array<string>, encoding: BufferEncoding, callback: TransformCallback) {

    for await (const line of chunk) {
      wordCounts[line] = (wordCounts[line] || 0) + 1;
    }
    callback()
  }
});

const writeVectorFile = async () => {
  const args = process.argv.slice(2);

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

  try {
    await readableStream.pipe(textSplitter).pipe(frequencyCollector).pipe(writeStream);
  } catch (err) {
    console.log(`Pipeline failed: ${err}`);
  }
};

writeVectorFile();