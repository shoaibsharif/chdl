const Fs = require('fs');
const Path = require('path');
const Axios = require('axios');
const _progress = require('cli-progress');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { isURL, isEmpty, contains } = require('validator');

let courseHunterUrl, startIndex, lastIndex, folder;

const inquiry = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'courseHunterUrl',
      message: 'Please enter the coursehunter url',
      validate: value => {
        if (!isURL(value) || isEmpty(value)) {
          return 'Please enter a valid URL';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'folder',
      message: 'What do you want to name the folder',
      validate: value => {
        if (isEmpty(value) || contains(value, ' ')) return 'Please enter a valid folder name';
        return true;
      }
    },
    {
      type: 'number',
      name: 'startIndex',
      message: 'What is the starting index',
      validate: value => {
        if (isNaN(value)) return 'Index must be a integer number';
        return true;
      }
    },
    {
      type: 'number',
      name: 'lastIndex',
      message: 'What is the last index',
      validate: value => {
        if (isNaN(value)) return 'Index must be a integer number';
        return true;
      }
    }
  ]);
  if (answers) {
    courseHunterUrl = answers.courseHunterUrl;
    folder = answers.folder;
    startIndex = answers.startIndex;
    lastIndex = answers.lastIndex;
  }
};

async function downloadVideo(startIndex, lastIndex, folder) {
  let number = startIndex;
  if (number === 0) {
    console.log('startIndex can not be 0');
    return;
  }

  const url = `${courseHunterUrl}/lesson${number}.mp4`;
  const path = Path.resolve(__dirname, folder, `lesson${number}.mp4`);
  const writer = Fs.createWriteStream(path);

  const response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  // Getting the whole content length
  const total = response.headers['content-length'];

  // initialize the cli-progress
  let progress = 0;
  const bar = new _progress.Bar(
    {
      barsize: 65,
      position: 'center',
      format: chalk.blue(`Downloading ${number} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} bytes`)
    },
    _progress.Presets.shades_grey
  );
  bar.start(total, 0);

  // Updating the progress cli on data
  response.data.on('data', chunk => {
    progress += chunk.length;
    bar.update(progress);
  });

  // piping the data with the response
  response.data.pipe(writer);

  // On finishing the data send the complete message & check if the lastIndex is the same as firstIndex
  writer.on('finish', () => {
    bar.stop();
    console.log(chalk.green('Download completed', number));
    debugger;
    if (lastIndex > number) {
      number++;
      downloadVideo(number, lastIndex, folder);
    }
  });
  writer.on('error', () => console.error('error'));
}

inquiry()
  .then(() => {
    try {
      Fs.accessSync(folder, Fs.constants.R_OK);
    } catch (error) {
      Fs.mkdirSync(folder);
    }
    downloadVideo(startIndex, lastIndex, folder).catch(err => console.log(err));
  })
  .catch(err => console.log(err));
