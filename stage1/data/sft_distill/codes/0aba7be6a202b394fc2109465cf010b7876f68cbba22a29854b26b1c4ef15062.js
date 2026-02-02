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
  // 无需预加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });

  // 添加提示文本
  this.add.text(400, 300, '点击任意位置生成星形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建星形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createStar(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 星形参数
  const size = 64; // 星形大小
  const points = 5; // 五角星
  const innerRadius = size * 0.4; // 内半径
  const outerRadius = size * 0.5; // 外半径
  
  // 计算星形顶点
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push(
      x + Math.cos(angle) * radius,
      y + Math.sin(angle) * radius
    );
  }
  
  // 绘制星形
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使星形更明显
  graphics.lineStyle(2, 0xFF8C00, 1);
  graphics.strokePath();
}

new Phaser.Game(config);