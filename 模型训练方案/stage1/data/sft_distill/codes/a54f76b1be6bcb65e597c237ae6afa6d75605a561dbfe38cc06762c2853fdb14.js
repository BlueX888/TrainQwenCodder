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

let hexagon;
let keys;
const SPEED = 240; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建六边形图形
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const hexSize = 30;
  const hexPath = new Phaser.Geom.Polygon();
  const points = [];
  
  // 计算六边形的6个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使顶点朝上
    const x = hexSize + Math.cos(angle) * hexSize;
    const y = hexSize + Math.sin(angle) * hexSize;
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  hexPath.setTo(points);
  
  // 填充六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillPoints(hexPath.points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexSize * 2, hexSize * 2);
  graphics.destroy();
  
  // 创建六边形精灵，放在屏幕中央
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置键盘输入（WASD）
  keys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加说明文字
  this.add.text(10, 10, 'Use WASD to move the hexagon', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keys.left.isDown) {
    hexagon.x -= distance;
  }
  if (keys.right.isDown) {
    hexagon.x += distance;
  }
  if (keys.up.isDown) {
    hexagon.y -= distance;
  }
  if (keys.down.isDown) {
    hexagon.y += distance;
  }
  
  // 边界限制（可选，防止移出屏幕）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

new Phaser.Game(config);