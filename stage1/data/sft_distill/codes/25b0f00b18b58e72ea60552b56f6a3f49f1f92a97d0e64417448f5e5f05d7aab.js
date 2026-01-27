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
let keys;
const SPEED = 360; // 像素/秒

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

  // 创建玩家方块（放置在屏幕中心）
  player = this.add.sprite(400, 300, 'playerBlock');

  // 绑定 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧应移动的距离 = 速度 * 时间增量（秒）
  const distance = SPEED * (delta / 1000);

  // 检测 WASD 键并移动方块
  if (keys.w.isDown) {
    player.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    player.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    player.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    player.x += distance; // 向右移动
  }

  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);