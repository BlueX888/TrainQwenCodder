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
const SPEED = 80; // 像素/秒

function preload() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('playerBlock', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建玩家方块，初始位置在屏幕中心
  player = this.add.sprite(400, 300, 'playerBlock');
  
  // 添加 WASD 键盘监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文字
  this.add.text(10, 10, 'Use WASD to move the block', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧应移动的距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新玩家位置
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
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

new Phaser.Game(config);