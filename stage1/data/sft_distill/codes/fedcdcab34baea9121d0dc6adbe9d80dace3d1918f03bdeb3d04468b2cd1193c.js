const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建六边形 Graphics 对象
  hexagon = this.add.graphics();
  hexagon.x = 400;
  hexagon.y = 300;
  
  // 绘制六边形
  drawHexagon(hexagon, 0, 0, 40);
  
  // 设置 WASD 键盘控制
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算速度向量
  let velocityX = 0;
  let velocityY = 0;
  
  if (keys.a.isDown) {
    velocityX = -1;
  } else if (keys.d.isDown) {
    velocityX = 1;
  }
  
  if (keys.w.isDown) {
    velocityY = -1;
  } else if (keys.s.isDown) {
    velocityY = 1;
  }
  
  // 归一化对角线移动速度（避免对角线移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 根据 delta 时间更新位置 (delta 单位是毫秒)
  hexagon.x += velocityX * SPEED * (delta / 1000);
  hexagon.y += velocityY * SPEED * (delta / 1000);
  
  // 边界限制（可选）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

/**
 * 绘制六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} centerX - 中心 X 坐标
 * @param {number} centerY - 中心 Y 坐标
 * @param {number} radius - 半径
 */
function drawHexagon(graphics, centerX, centerY, radius) {
  const points = [];
  
  // 计算六边形的 6 个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60 度间隔
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制填充六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 绘制边框
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
}

new Phaser.Game(config);