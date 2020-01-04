const cheerio = require('cheerio');
const axios = require('axios');

const LessonName = async webUrl => {
  const { data: html } = await axios.get(webUrl);
  const $ = cheerio.load(html);
  const lessons = [];
  $('.lessons-name').each(function(i, elem) {
    lessons.push($(this).text());
  });
  console.log(lessons);
};

LessonName('https://coursehunter.net/course/docker-i-kubernetes-polnoe-rukovodstvo');
