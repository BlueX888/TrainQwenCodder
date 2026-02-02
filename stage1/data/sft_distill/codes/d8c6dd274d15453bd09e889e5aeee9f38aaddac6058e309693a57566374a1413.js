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
let keys;
// 移动速度（像素/秒）
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 50, 50); // 50x50 的矩形
  
  // 将 graphics 转换为纹理
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象
  
  // 创建玩家精灵并放置在屏幕中心
  player = this.add.image(400, 300, 'playerRect');
  
  // 设置按键监听
  keys = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间差 / 1000，delta 单位是毫秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态并设置速度
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
  
  // 如果同时按下多个键，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    // 对角线移动时，使用勾股定理归一化，保持速度恒定
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;
  
  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 启动游戏
new Phaser.Game(config);