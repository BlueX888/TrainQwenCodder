const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 360; // 像素/秒

function preload() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家方块，放置在屏幕中心
  player = this.add.sprite(400, 300, 'playerBlock');
  
  // 添加 WASD 键盘控制
  cursors = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the block', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间（秒）
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键并设置移动方向
  if (cursors.w.isDown) {
    velocityY = -1;
  } else if (cursors.s.isDown) {
    velocityY = 1;
  }
  
  if (cursors.a.isDown) {
    velocityX = -1;
  } else if (cursors.d.isDown) {
    velocityX = 1;
  }
  
  // 如果同时按下两个方向键，进行归一化处理（保持对角线速度一致）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;
  
  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);