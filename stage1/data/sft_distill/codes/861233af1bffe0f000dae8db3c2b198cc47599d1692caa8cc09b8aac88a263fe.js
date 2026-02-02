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

// 玩家对象
let player;
// 按键对象
let keyW, keyA, keyS, keyD;
// 移动速度（像素/秒）
const SPEED = 300;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建玩家矩形（使用 Graphics）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 50, 50); // 50x50 的矩形
  
  // 将 graphics 转换为纹理
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy(); // 销毁临时 graphics
  
  // 创建玩家精灵并设置初始位置
  player = this.add.sprite(400, 300, 'playerRect');
  
  // 设置 WASD 按键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧应该移动的距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键并设置速度方向
  if (keyW.isDown) {
    velocityY = -1; // 向上
  }
  if (keyS.isDown) {
    velocityY = 1; // 向下
  }
  if (keyA.isDown) {
    velocityX = -1; // 向左
  }
  if (keyD.isDown) {
    velocityX = 1; // 向右
  }
  
  // 如果同时按下多个方向键，进行归一化处理（保持斜向移动速度一致）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;
  
  // 边界限制（可选，防止移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 创建游戏实例
new Phaser.Game(config);