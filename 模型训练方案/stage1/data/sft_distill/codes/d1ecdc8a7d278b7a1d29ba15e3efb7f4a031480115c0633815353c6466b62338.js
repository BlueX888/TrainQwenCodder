const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let keys;
const SPEED = 360; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建六边形 Graphics 对象
  hexagon = this.add.graphics();
  hexagon.x = 400;
  hexagon.y = 300;
  
  // 绘制六边形
  drawHexagon(hexagon);
  
  // 添加 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算当前帧的移动距离 (速度 * 时间)
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keys.w.isDown) {
    hexagon.y -= distance;
  }
  if (keys.s.isDown) {
    hexagon.y += distance;
  }
  if (keys.a.isDown) {
    hexagon.x -= distance;
  }
  if (keys.d.isDown) {
    hexagon.x += distance;
  }
  
  // 边界限制（可选）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

/**
 * 绘制六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 */
function drawHexagon(graphics) {
  const radius = 40;
  const points = [];
  
  // 计算六边形的六个顶点坐标
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 绘制六边形边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
}

new Phaser.Game(config);