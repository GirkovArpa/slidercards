import { $, $$ } from '@sciter';

const ENTER = 13;
const SPACE = 32;

const [screen_width, screen_height] = Window.this.screenBox('frame', 'dimension');
Window.this.width = screen_width;
Window.this.height = screen_height;
Window.this.move(0, 0, screen_width, screen_height, true);
Window.this.on('statechange', () => Window.this.isTopmost = true);

const seconds = function (s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

const until = function (condition) {
  return new Promise((resolve) => {
    setInterval(() => condition() && resolve());
  })
}

const shuffle = function(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = ~~(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function displayCard(Q, A) {
  const card = <div class="card" answer={A}>
    <span class="question">{Q}</span>
    <input class="answer" novalue="Enter the answer" />
    <span class="idk">I don't know</span>
  </div>;

  $('body').append(card);
  $('.answer').focus();

  $('.answer').on('keydown', async function (evt) {
    this.classList.remove('incorrect');
    if (evt.keyCode === SPACE) {
      this.parentElement.classList.add('flip');
    }
    if (evt.keyCode === ENTER) {
      const { answer } = this.parentElement.attributes;
      const correct = this.value === answer;
      if (correct) {
        onCorrectAnswer();
      }
      if (!correct && !this.parentElement.classList.contains('incorrect')) {
        this.classList.add('incorrect');
        this.parentElement.classList.add('incorrect', 'incorrect-a');
        await seconds(0.05);
        this.parentElement.classList.add('incorrect-b');
        this.parentElement.classList.remove('incorrect-a');
        await seconds(0.05);
        this.parentElement.classList.add('incorrect-a');
        this.parentElement.classList.remove('incorrect-b');
        await seconds(0.05);
        this.parentElement.classList.add('incorrect-b');
        this.parentElement.classList.remove('incorrect-a');
        await seconds(0.05);
        this.parentElement.classList.remove('incorrect-b', 'incorrect');
      }
    }
  });

  await seconds(.5);
  $('.card').classList.add('a');
}

async function onCorrectAnswer() {
  $('.card').classList.add('b');
  await seconds(1);
  $('.card').classList.add('c');
  await seconds(.25);
  $('.card').classList.add('c-2');
  await seconds(.25);
  $('.card').classList.add('d');
  await seconds(.75);
  $('.card').remove();
}

async function main() {
  const response = await fetch('cards.json');
  const cards = await response.json();
  shuffle(cards);
  let i = 0;
  while (true) {
    if (i === cards.length) {
      i = 0;
      shuffle(cards);
    }
    const card = cards[i++];
    const { question, answer } = card;
    displayCard(question, answer);
    await until(() => $('.card') === null);
  }
}

main();