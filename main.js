import { $, $$ } from '@sciter';

const ENTER = 13;
const SPACE = 32;
const AUDIO = { };

async function playSound(key) {
  const file = `assets/audio/${key}.mp3`;
  if (!AUDIO[key]) {
    AUDIO[key] = await Audio.load(file);
  }
  AUDIO[key].play();
  AUDIO[key] = await Audio.load(file);
}

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

const shuffle = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = ~~(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function displayCard(Q, A) {
  const card =
    <div class="card" answer={A}>
      <span class="question">{Q}</span>
      <input class="answer" novalue="Enter the answer" />
      <span class="idk">I don't know</span>
    </div>;

  $('body').append(card);
  $('.answer').focus();

  $('.answer').on('keydown', async function (evt) {
    this.classList.remove('incorrect');
    if (evt.keyCode === ENTER) {
      const { answer } = this.parentElement.attributes;
      const correct = this.value === answer;
      if (correct) {
        onCorrectAnswer();
      }
      if (!correct && !this.parentElement.classList.contains('incorrect')) {
        playSound('incorrect');
        this.classList.add('incorrect');
        this.parentElement.classList.add('incorrect');
        await seconds(0.5);
        this.parentElement.classList.remove('incorrect');
      }
    }
  });

  $('.idk').on('click', async function () {
    this.parentElement.classList.add('flip');
    await seconds(0.25);
    this.parentElement.classList.remove('flip');
    $('.question').textContent = A;
    $('.answer').style.display = 'none';
    $('.idk').style.display = 'none';
    await seconds(1);
    this.parentElement.classList.add('flip');
    await seconds(0.25);
    this.parentElement.classList.remove('flip');
    $('.question').textContent = Q;
    $('.answer').style.display = 'block';
    $('.idk').style.display = 'block';
  });

  await seconds(0.5);
  $('.card').classList.add('flyin');
}

async function onCorrectAnswer() {
  playSound('correct');
  $('.card').classList.add('animate');
  $('.animate').on('animationend', async () => {
    $('.card').classList.add('flyout');
    await seconds(0.3);
    $('.card').remove();
  });
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