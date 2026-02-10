const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个黄色星形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 星形中心X坐标
 * @param {number} y - 星形中心Y坐标
 */
function createStar(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xFFFF00, 1);
  
  // 星形参数
  const outerRadius = 40; // 外半径（总大小80像素）
  const innerRadius = 16; // 内半径
  const points = 5; // 五角星
  const angle = Math.PI / points; // 每个角的弧度
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形的顶点坐标
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const currentAngle = i * angle - Math.PI / 2; // 从顶部开始
    const pointX = x + Math.cos(currentAngle) * radius;
    const pointY = y + Math.sin(currentAngle) * radius;
    
    if (i === 0) {
      graphics.moveTo(pointX, pointY);
    } else {
      graphics.lineTo(pointX, pointY);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);