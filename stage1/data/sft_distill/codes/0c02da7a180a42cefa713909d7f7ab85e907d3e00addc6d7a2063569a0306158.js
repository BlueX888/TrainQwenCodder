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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点坐标（半径 30 像素）
  const radius = 30;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建六边形精灵并放置在屏幕中央
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置键盘输入（WASD）
  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文字
  this.add.text(10, 10, 'Use WASD to move the hexagon', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新六边形位置
  if (keys.W.isDown) {
    hexagon.y -= distance;
  }
  if (keys.S.isDown) {
    hexagon.y += distance;
  }
  if (keys.A.isDown) {
    hexagon.x -= distance;
  }
  if (keys.D.isDown) {
    hexagon.x += distance;
  }
  
  // 限制六边形在屏幕范围内
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

new Phaser.Game(config);