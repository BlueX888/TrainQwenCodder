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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形路径（中心在 32, 32，边长约 32）
  const path = new Phaser.Geom.Polygon([
    32, 0,    // 上顶点
    64, 32,   // 右顶点
    32, 64,   // 下顶点
    0, 32     // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamondTex', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  diamond = this.add.sprite(400, 300, 'diamondTex');
  
  // 设置 WASD 键盘控制
  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧应该移动的距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态移动菱形
  if (keys.W.isDown) {
    diamond.y -= distance; // 向上移动
  }
  if (keys.S.isDown) {
    diamond.y += distance; // 向下移动
  }
  if (keys.A.isDown) {
    diamond.x -= distance; // 向左移动
  }
  if (keys.D.isDown) {
    diamond.x += distance; // 向右移动
  }
  
  // 边界限制（可选）
  diamond.x = Phaser.Math.Clamp(diamond.x, 32, 768);
  diamond.y = Phaser.Math.Clamp(diamond.y, 32, 568);
}

new Phaser.Game(config);