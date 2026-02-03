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

let diamond;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制菱形（中心点在 32, 32，边长约 32 像素）
  graphics.beginPath();
  graphics.moveTo(32, 0);      // 上顶点
  graphics.lineTo(64, 32);     // 右顶点
  graphics.lineTo(32, 64);     // 下顶点
  graphics.lineTo(0, 32);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamondTexture', 64, 64);
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成
  
  // 创建菱形精灵，初始位置在屏幕中心
  diamond = this.add.sprite(400, 300, 'diamondTexture');
  
  // 设置键盘输入 - WASD
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧应移动的距离（速度 * 时间差 / 1000）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新菱形位置
  if (keys.w.isDown) {
    diamond.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    diamond.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    diamond.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    diamond.x += distance; // 向右移动
  }
  
  // 可选：限制菱形在屏幕范围内
  diamond.x = Phaser.Math.Clamp(diamond.x, 32, 768);
  diamond.y = Phaser.Math.Clamp(diamond.y, 32, 568);
}

new Phaser.Game(config);