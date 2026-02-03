const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let keys;
const SPEED = 240; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建六边形 Graphics 对象
  hexagon = this.add.graphics();
  hexagon.x = 400;
  hexagon.y = 300;
  
  // 绘制六边形
  drawHexagon(hexagon);
  
  // 添加 WASD 键位监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the hexagon', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离 = 速度 * 时间（转换为秒）
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
  const radius = 40; // 六边形半径
  const points = [];
  
  // 计算六边形的六个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 创建多边形路径
  const polygon = new Phaser.Geom.Polygon(points);
  
  // 填充六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillPoints(polygon.points, true);
  
  // 添加边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePoints(polygon.points, true);
}

new Phaser.Game(config);