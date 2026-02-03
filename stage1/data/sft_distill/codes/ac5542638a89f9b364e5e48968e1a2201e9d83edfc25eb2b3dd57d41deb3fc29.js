const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个橙色星形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - 星形中心 x 坐标
 * @param {number} y - 星形中心 y 坐标
 */
function createStar(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 星形参数
  const outerRadius = 32; // 外半径（总大小64像素）
  const innerRadius = 16; // 内半径
  const points = 5; // 5个角的星形
  
  // 计算星形顶点
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2; // 从顶部开始
    
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
}

new Phaser.Game(config);