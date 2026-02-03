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
  // 无需预加载资源
}

function create() {
  // 创建玩家矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 40, 40);
  
  // 将 graphics 转换为纹理
  graphics.generateTexture('playerRect', 40, 40);
  graphics.destroy();
  
  // 创建玩家精灵并居中
  player = this.add.sprite(400, 300, 'playerRect');
  
  // 设置 WASD 键位
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧应移动的距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keyW.isDown) {
    player.y -= distance;
  }
  if (keyS.isDown) {
    player.y += distance;
  }
  if (keyA.isDown) {
    player.x -= distance;
  }
  if (keyD.isDown) {
    player.x += distance;
  }
  
  // 边界限制（可选，防止矩形移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

new Phaser.Game(config);