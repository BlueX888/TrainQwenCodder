const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let diamond;
let keys;
const SPEED = 240; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形路径（中心点为原点）
  graphics.beginPath();
  graphics.moveTo(0, -25);   // 上顶点
  graphics.lineTo(25, 0);    // 右顶点
  graphics.lineTo(0, 25);    // 下顶点
  graphics.lineTo(-25, 0);   // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 50, 50);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在屏幕中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 添加 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧应移动的距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
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
}

new Phaser.Game(config);