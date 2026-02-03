const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建橙色星形
    createStar(this, pointer.x, pointer.y);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成星形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建橙色星形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createStar(scene, x, y) {
  // 使用 Graphics 绘制星形
  const graphics = scene.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制星形（5个顶点）
  const points = [];
  const numPoints = 5;
  const outerRadius = 16;
  const innerRadius = 8;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius
    });
  }
  
  // 开始绘制路径
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加淡入动画效果
  graphics.setAlpha(0);
  scene.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 200,
    ease: 'Power2'
  });
}

// 创建游戏实例
new Phaser.Game(config);