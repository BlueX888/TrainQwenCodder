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

// 菱形对象
let diamond;
// 键盘控制
let keys;
// 移动速度（像素/秒）
const SPEED = 360;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建菱形 Graphics 对象
  diamond = this.add.graphics();
  diamond.x = 400; // 初始位置 x
  diamond.y = 300; // 初始位置 y
  
  // 绘制菱形
  drawDiamond(diamond);
  
  // 设置 WASD 键盘控制
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间，delta 单位是毫秒）
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
  
  // 边界限制（可选，防止菱形移出屏幕）
  diamond.x = Phaser.Math.Clamp(diamond.x, 0, 800);
  diamond.y = Phaser.Math.Clamp(diamond.y, 0, 600);
}

/**
 * 绘制菱形形状
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 */
function drawDiamond(graphics) {
  graphics.fillStyle(0x00ff00, 1); // 绿色填充
  
  // 菱形的四个顶点坐标（相对于中心点）
  const size = 40;
  const path = new Phaser.Geom.Polygon([
    0, -size,      // 上顶点
    size, 0,       // 右顶点
    0, size,       // 下顶点
    -size, 0       // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
}

new Phaser.Game(config);