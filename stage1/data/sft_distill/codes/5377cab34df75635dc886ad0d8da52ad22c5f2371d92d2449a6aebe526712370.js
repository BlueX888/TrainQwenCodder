const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let keys;
const SPEED = 80; // 像素/秒

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制菱形（中心点在 32, 32，大小 64x64）
  graphics.beginPath();
  graphics.moveTo(32, 0);      // 上顶点
  graphics.lineTo(64, 32);     // 右顶点
  graphics.lineTo(32, 64);     // 下顶点
  graphics.lineTo(0, 32);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，放置在屏幕中央
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 添加 WASD 键盘输入
  keys = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  // delta 是毫秒，需要转换为秒
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态并设置速度方向
  if (keys.w.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.s.isDown) {
    velocityY = 1;  // 向下
  }
  if (keys.a.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.d.isDown) {
    velocityX = 1;  // 向右
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    // 使用勾股定理归一化，保持对角线移动速度一致
    const normalizer = Math.sqrt(2);
    velocityX /= normalizer;
    velocityY /= normalizer;
  }
  
  // 更新菱形位置
  diamond.x += velocityX * distance;
  diamond.y += velocityY * distance;
  
  // 限制菱形在屏幕范围内
  diamond.x = Phaser.Math.Clamp(diamond.x, 32, 768);
  diamond.y = Phaser.Math.Clamp(diamond.y, 32, 568);
}

new Phaser.Game(config);