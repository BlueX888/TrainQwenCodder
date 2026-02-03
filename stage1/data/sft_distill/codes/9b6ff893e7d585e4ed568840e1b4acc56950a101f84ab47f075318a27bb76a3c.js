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
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });

  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成星形', {
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
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 星形参数
  const size = 64; // 星形大小（外半径）
  const points = 5; // 星形的角数
  const innerRadius = size * 0.4; // 内半径（外半径的40%）
  const outerRadius = size / 2; // 外半径
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形各顶点坐标
  for (let i = 0; i < points * 2; i++) {
    // 角度（从顶部开始，顺时针）
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算顶点坐标
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    
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