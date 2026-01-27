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
  // 使用 Graphics 生成方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBox', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家方块，初始位置在屏幕中心
  player = this.add.sprite(400, 300, 'playerBox');
  player.setOrigin(0.5, 0.5);

  // 绑定 WASD 键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧的移动距离
  const moveDistance = SPEED * deltaSeconds;

  // 检测 WASD 按键状态并移动方块
  if (keyW.isDown) {
    player.y -= moveDistance;
  }
  if (keyS.isDown) {
    player.y += moveDistance;
  }
  if (keyA.isDown) {
    player.x -= moveDistance;
  }
  if (keyD.isDown) {
    player.x += moveDistance;
  }

  // 限制方块在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);