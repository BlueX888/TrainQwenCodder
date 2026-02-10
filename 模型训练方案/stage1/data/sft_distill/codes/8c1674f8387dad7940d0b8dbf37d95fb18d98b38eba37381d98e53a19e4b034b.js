const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 300;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.generateTexture('player', PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.destroy();

  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'player');
  player.setOrigin(0.5, 0.5);

  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);

  // 临时存储新位置
  let newX = player.x;
  let newY = player.y;

  // 根据方向键更新位置
  if (cursors.left.isDown) {
    newX -= distance;
  }
  if (cursors.right.isDown) {
    newX += distance;
  }
  if (cursors.up.isDown) {
    newY -= distance;
  }
  if (cursors.down.isDown) {
    newY += distance;
  }

  // 限制在画布边界内（考虑矩形的宽高）
  const halfWidth = PLAYER_WIDTH / 2;
  const halfHeight = PLAYER_HEIGHT / 2;

  player.x = Phaser.Math.Clamp(newX, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(newY, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);