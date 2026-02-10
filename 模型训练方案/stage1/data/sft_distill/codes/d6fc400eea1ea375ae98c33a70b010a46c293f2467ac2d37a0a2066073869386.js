const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let hexagon;
let velocityX = 160;
let velocityY = 120;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制六边形（中心点为原点）
  const size = 30; // 六边形半径
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每60度一个顶点
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(new Phaser.Math.Vector2(x, y));
  }
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', size * 2, size * 2);
  graphics.destroy(); // 销毁临时 graphics 对象
  
  // 创建六边形精灵
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始位置（随机）
  hexagon.x = Phaser.Math.Between(100, 700);
  hexagon.y = Phaser.Math.Between(100, 500);
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const deltaSeconds = delta / 1000;
  hexagon.x += velocityX * deltaSeconds;
  hexagon.y += velocityY * deltaSeconds;
  
  // 获取六边形的边界
  const radius = 30;
  
  // 检测左右边界碰撞
  if (hexagon.x - radius <= 0) {
    hexagon.x = radius;
    velocityX = Math.abs(velocityX); // 向右反弹
  } else if (hexagon.x + radius >= 800) {
    hexagon.x = 800 - radius;
    velocityX = -Math.abs(velocityX); // 向左反弹
  }
  
  // 检测上下边界碰撞
  if (hexagon.y - radius <= 0) {
    hexagon.y = radius;
    velocityY = Math.abs(velocityY); // 向下反弹
  } else if (hexagon.y + radius >= 600) {
    hexagon.y = 600 - radius;
    velocityY = -Math.abs(velocityY); // 向上反弹
  }
}

new Phaser.Game(config);