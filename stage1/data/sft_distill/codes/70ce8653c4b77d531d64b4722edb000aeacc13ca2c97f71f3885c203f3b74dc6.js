const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let keys = {};
const SPEED = 200; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();

  // 创建玩家方块精灵，放置在屏幕中心
  player = this.add.sprite(400, 300, 'playerBlock');

  // 绑定 WASD 键
  keys.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);

  // 根据按键状态移动方块
  if (keys.W.isDown) {
    player.y -= distance; // 向上移动
  }
  if (keys.S.isDown) {
    player.y += distance; // 向下移动
  }
  if (keys.A.isDown) {
    player.x -= distance; // 向左移动
  }
  if (keys.D.isDown) {
    player.x += distance; // 向右移动
  }

  // 限制方块在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);