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
const SPEED = 300;

function preload() {
  // 创建黄色六边形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 计算六边形顶点（半径为 30）
  const radius = 30;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    points.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制黄色六边形
  graphics.fillStyle(0xFFD700, 1); // 金黄色
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵，放置在画布中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -moveDistance;
  } else if (cursors.right.isDown) {
    velocityX = moveDistance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -moveDistance;
  } else if (cursors.down.isDown) {
    velocityY = moveDistance;
  }
  
  // 更新位置
  hexagon.x += velocityX;
  hexagon.y += velocityY;
  
  // 边界限制（考虑六边形的半径）
  const halfWidth = hexagon.width / 2;
  const halfHeight = hexagon.height / 2;
  
  if (hexagon.x - halfWidth < 0) {
    hexagon.x = halfWidth;
  } else if (hexagon.x + halfWidth > config.width) {
    hexagon.x = config.width - halfWidth;
  }
  
  if (hexagon.y - halfHeight < 0) {
    hexagon.y = halfHeight;
  } else if (hexagon.y + halfHeight > config.height) {
    hexagon.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);