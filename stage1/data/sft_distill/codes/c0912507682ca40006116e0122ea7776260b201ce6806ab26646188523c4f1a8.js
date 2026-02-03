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
// 键盘按键
let keyW, keyA, keyS, keyD;
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
  
  // 设置初始位置（屏幕中心）
  player.x = 400 - 20; // 减去矩形宽度的一半
  player.y = 300 - 20; // 减去矩形高度的一半
  
  // 绑定 WASD 键
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
  
  // 重置速度向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态并设置速度
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
  
  // 如果同时按下多个方向键，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    // 对角线移动时保持速度恒定（勾股定理）
    const normalizer = Math.sqrt(2);
    velocityX /= normalizer;
    velocityY /= normalizer;
  }
  
  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;
  
  // 边界限制（防止矩形移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 0, 800 - 40);
  player.y = Phaser.Math.Clamp(player.y, 0, 600 - 40);
}

// 启动游戏
new Phaser.Game(config);