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
let cursors;
const SPEED = 120;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色六边形
  const graphics = this.add.graphics();
  
  // 设置白色填充
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制六边形（正六边形）
  const hexRadius = 30;
  const hexPoints = [];
  
  // 计算六边形的6个顶点坐标
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制六边形路径
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形 Sprite，放置在画布中心
  hexagon = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'hexagon'
  );
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算每帧移动距离（速度 * 时间差）
  const moveDistance = SPEED * (delta / 1000);
  
  // 检测方向键并移动六边形
  if (cursors.left.isDown) {
    hexagon.x -= moveDistance;
  }
  if (cursors.right.isDown) {
    hexagon.x += moveDistance;
  }
  if (cursors.up.isDown) {
    hexagon.y -= moveDistance;
  }
  if (cursors.down.isDown) {
    hexagon.y += moveDistance;
  }
  
  // 限制六边形在画布边界内
  // 考虑六边形的半径（宽度的一半）
  const halfWidth = hexagon.width / 2;
  const halfHeight = hexagon.height / 2;
  
  hexagon.x = Phaser.Math.Clamp(
    hexagon.x,
    halfWidth,
    config.width - halfWidth
  );
  
  hexagon.y = Phaser.Math.Clamp(
    hexagon.y,
    halfHeight,
    config.height - halfHeight
  );
}

// 启动游戏
new Phaser.Game(config);