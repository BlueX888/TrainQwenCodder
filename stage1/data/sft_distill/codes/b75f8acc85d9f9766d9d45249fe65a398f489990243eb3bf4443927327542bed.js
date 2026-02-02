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
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBox', 50, 50);
  graphics.destroy();

  // 创建玩家方块，放置在屏幕中央
  player = this.add.image(400, 300, 'playerBox');

  // 监听 WASD 键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测按键并设置移动方向
  if (keyW.isDown) {
    velocityY = -1;
  }
  if (keyS.isDown) {
    velocityY = 1;
  }
  if (keyA.isDown) {
    velocityX = -1;
  }
  if (keyD.isDown) {
    velocityX = 1;
  }

  // 如果同时按下两个方向键，进行归一化处理
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;

  // 限制玩家在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);