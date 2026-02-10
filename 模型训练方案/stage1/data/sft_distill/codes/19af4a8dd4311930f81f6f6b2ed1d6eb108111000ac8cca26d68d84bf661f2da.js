const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 玩家对象
let player;
// 键盘控制
let keys;
// 移动速度（像素/秒）
const SPEED = 120;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建玩家矩形（使用 Graphics）
  player = this.add.graphics();
  player.fillStyle(0x00ff00, 1); // 绿色矩形
  player.fillRect(0, 0, 40, 40); // 40x40 的矩形
  
  // 设置初始位置（居中）
  player.x = 400 - 20; // 减去矩形宽度的一半
  player.y = 300 - 20; // 减去矩形高度的一半
  
  // 添加 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置移动向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态
  if (keys.W.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.S.isDown) {
    velocityY = 1; // 向下
  }
  if (keys.A.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.D.isDown) {
    velocityX = 1; // 向右
  }
  
  // 处理斜向移动（归一化向量，保持恒定速度）
  if (velocityX !== 0 && velocityY !== 0) {
    const factor = Math.sqrt(2) / 2; // 约 0.707
    velocityX *= factor;
    velocityY *= factor;
  }
  
  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;
  
  // 边界限制（防止矩形移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 0, 800 - 40);
  player.y = Phaser.Math.Clamp(player.y, 0, 600 - 40);
}

new Phaser.Game(config);