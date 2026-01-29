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
let keyW, keyA, keyS, keyD;
const SPEED = 240; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();

  // 创建玩家方块，初始位置在屏幕中心
  player = this.add.sprite(400, 300, 'playerBlock');

  // 绑定 WASD 键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the block', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  // delta 单位是毫秒，需要转换为秒
  const distance = SPEED * (delta / 1000);

  // 检测按键并移动方块
  if (keyW.isDown) {
    player.y -= distance; // 向上移动
  }
  if (keyS.isDown) {
    player.y += distance; // 向下移动
  }
  if (keyA.isDown) {
    player.x -= distance; // 向左移动
  }
  if (keyD.isDown) {
    player.x += distance; // 向右移动
  }

  // 限制方块在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);