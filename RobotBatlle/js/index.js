const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');

let collisions = 0; // total de colisões ocorridas
const speed = 5; // velocidade de movimento dos robos
const size = 40; // tamanho dos robos;
const players = {
  player1: { // propriedades do robo 1
    x: 10,
    y: 10,
    image: (() => {
      const image = new Image();
      image.src = '../img/robot_1.svg';
      image.onload = render
      return image;
    })(),
    movements: new Array(4).fill(false), // variaveis booleanas de movimento do robo 1
    damage: getRandom(),
    life_bar: document.querySelectorAll('.progress')[0],
    life_value: document.querySelectorAll('.life')[0],
    keys: [ // teclas correspondentes aos movimentos do robo 1
      { code: 65, dir: 'left' }, 
      { code: 87, dir: 'up' },
      { code: 68, dir: 'right' }, 
      { code: 83, dir: 'down' }
    ]
  },
  player2: { // propriedades do robo 2
    x: canvas.width - size - 10,
    y: canvas.height - size - 10,
    image: (() => {
      const image = new Image();
      image.src = '../img/robot_2.svg';
      image.onload = render
      return image;
    })(),
    color: '#1f2225',
    movements: new Array(4).fill(false), // variaveis booleanas de movimento do robo 2
    damage: getRandom(),
    life_bar: document.querySelectorAll('.progress')[1],
    life_value: document.querySelectorAll('.life')[1],
    keys: [ // teclas correspondentes aos movimentos do robo 2
      { code: 37, dir: 'left' }, 
      { code: 38, dir: 'up' },
      { code: 39, dir: 'right' }, 
      { code: 40, dir: 'down' }
    ],
  }
}

function render() { // funcao de renderizacao
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(players.player1.image, players.player1.x, players.player1.y);
  context.drawImage(players.player2.image, players.player2.x, players.player2.y);
}

const handleKey = ({ keyCode, type }) => { // funcao manipuladora das teclas
  let player;
  
  if (players.player1.keys.some(k => k.code === keyCode)) player = 'player1';
  else if (players.player2.keys.some(k => k.code === keyCode)) player = 'player2';
  
  if (player && !crash(player)) {
    const movements = players[player].movements;
    const condition = type === 'keydown' ? true : false;
    const setMovement = {
      'left': () => movements[0] = condition,
      'up': () => movements[1] = condition,
      'right': () => movements[2] = condition,
      'down': () => movements[3] = condition,
    }
    const { dir } = players[player].keys.find(k => k.code === keyCode);
    setMovement[dir]();
    movement(player);
    render();
  }
}

const movement = (_player) => {
  const player = players[_player];
  const prev = {...player};

  if (player.movements[0]) player.x -= speed;
  if (player.movements[1]) player.y -= speed;
  if (player.movements[2]) player.x += speed;
  if (player.movements[3]) player.y += speed;

  player.x = Math.max(0, Math.min(player.x, canvas.width - size));
  player.y = Math.max(0, Math.min(player.y, canvas.height - size));

  if (crash(_player)) {
    player.x = prev.x;
    player.y = prev.y;
    damageCount();
  }
}

const crash = (_player) => {
  const player = players[_player];
  const another = _player === 'player1' ? players.player2 : players.player1;
  return (
    player.x < another.x + size &&
    player.y < another.y + size &&
    player.x + size > another.x &&
    player.y + size > another.y
  );
}

const damageCount = () => {
  const [p1, p2] = [players.player1, players.player2];
  p1.life_bar.value -= p1.damage;
  p2.life_bar.value -= p2.damage;
  p1.life_value.textContent = p1.life_bar.value;
  p2.life_value.textContent = p2.life_bar.value;
  p1.damage = getRandom();
  p2.damage = getRandom();
  collisions++;
  document.querySelector('.collisions').textContent = collisions;

  if(collisions === 5) finishGame(p1.life_value.textContent, p2.life_value.textContent);
}

const finishGame = (d1, d2) => {
  window.removeEventListener('keydown', handleKey);
  window.removeEventListener('keyup', handleKey);

  const [first, second] = d1 > d2 ? ['Player 1', 'Player 2'] : ['Player 2', 'Player 1'];
  document.querySelector('.finish-game').classList.add('active');
  document.querySelector('.content').innerHTML = `
    <p>1º - ${first} (${Math.max(d1, d2)})</p>
    <p>2º - ${second} (${Math.min(d1, d2)})</p>
  `;
  document.querySelector('.modal').animate([
    {
      opacity: 0,
      transform: 'translateY(-10px)'
    },
    {
      opacity: 1,
      transform: 'translateY(0)'
    }
  ], 300);
  document.querySelector('.reset').addEventListener('click', () => {
    window.location.reload();
  });
}

function getRandom() { 
  return Math.floor(Math.random() * 20); 
}

window.addEventListener('keydown', handleKey);
window.addEventListener('keyup', handleKey);