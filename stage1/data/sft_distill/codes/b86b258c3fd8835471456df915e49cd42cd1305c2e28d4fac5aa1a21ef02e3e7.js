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

let star;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 绘制五角星
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffa500, 1); // 橙色边框
  
  // 星形的顶点坐标（以中心为原点）
  const points = [];
  const outerRadius = 30;
  const innerRadius = 12;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 32 + Math.cos(angle) * radius,
      y: 32 + Math.sin(angle) * radius
    });
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在屏幕中央
  star = this.add.sprite(400, 300, 'star');
  
  // 设置键盘输入 - WASD
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间增量（秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新星形位置
  if (keys.w.isDown) {
    star.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    star.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    star.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    star.x += distance; // 向右移动
  }
  
  // 限制星形在屏幕范围内
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

new Phaser.Game(config);