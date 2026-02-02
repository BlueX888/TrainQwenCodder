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
let cursors = {};
const SPEED = 80; // 像素/秒

function preload() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('playerBlock', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家方块，初始位置在屏幕中心
  player = this.add.sprite(400, 300, 'playerBlock');
  
  // 添加 WASD 键盘监听
  cursors.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  cursors.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  cursors.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  cursors.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the block', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧的移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // W 键：向上移动
  if (cursors.W.isDown) {
    player.y -= distance;
  }
  
  // S 键：向下移动
  if (cursors.S.isDown) {
    player.y += distance;
  }
  
  // A 键：向左移动
  if (cursors.A.isDown) {
    player.x -= distance;
  }
  
  // D 键：向右移动
  if (cursors.D.isDown) {
    player.x += distance;
  }
  
  // 限制方块在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 16, 784);
  player.y = Phaser.Math.Clamp(player.y, 16, 584);
}

new Phaser.Game(config);