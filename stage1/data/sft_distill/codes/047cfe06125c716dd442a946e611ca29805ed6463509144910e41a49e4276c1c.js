const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let keys;
const SPEED = 360; // 像素/秒

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建菱形图形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制菱形（使用路径）
  // 菱形中心在 (0, 0)，大小为 40x40
  graphics.beginPath();
  graphics.moveTo(0, -20);    // 上顶点
  graphics.lineTo(20, 0);     // 右顶点
  graphics.lineTo(0, 20);     // 下顶点
  graphics.lineTo(-20, 0);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 设置描边
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 将菱形放置在屏幕中央
  diamond = graphics;
  diamond.x = 400;
  diamond.y = 300;
  
  // 设置 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文字
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  // delta 是毫秒，需要转换为秒
  const distance = SPEED * (delta / 1000);
  
  // 初始化速度向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 W 键（向上）
  if (keys.w.isDown) {
    velocityY = -1;
  }
  
  // 检测 S 键（向下）
  if (keys.s.isDown) {
    velocityY = 1;
  }
  
  // 检测 A 键（向左）
  if (keys.a.isDown) {
    velocityX = -1;
  }
  
  // 检测 D 键（向右）
  if (keys.d.isDown) {
    velocityX = 1;
  }
  
  // 如果同时按下多个方向键，需要归一化速度向量
  // 避免斜向移动速度过快
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新菱形位置
  diamond.x += velocityX * distance;
  diamond.y += velocityY * distance;
  
  // 可选：限制菱形在屏幕范围内
  diamond.x = Phaser.Math.Clamp(diamond.x, 20, 780);
  diamond.y = Phaser.Math.Clamp(diamond.y, 20, 580);
}

new Phaser.Game(config);