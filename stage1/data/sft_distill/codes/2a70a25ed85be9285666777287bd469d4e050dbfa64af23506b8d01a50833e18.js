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
const SPEED = 240; // 像素/秒

function preload() {
  // 使用 Graphics 生成方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('player', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家方块，放置在屏幕中央
  player = this.add.sprite(400, 300, 'player');
  player.setOrigin(0.5, 0.5);

  // 设置 WASD 键盘控制
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧应移动的距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态并设置移动方向
  if (keys.w.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.s.isDown) {
    velocityY = 1; // 向下
  }
  if (keys.a.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.d.isDown) {
    velocityX = 1; // 向右
  }
  
  // 如果同时按下多个方向键，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    // 对角线移动时，使用勾股定理归一化，保持速度恒定
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