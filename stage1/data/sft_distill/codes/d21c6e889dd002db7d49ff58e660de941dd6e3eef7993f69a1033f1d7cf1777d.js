const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 六边形大小（从中心到顶点的距离）
  const hexSize = 16;
  
  // 绘制20个随机位置的六边形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置，确保六边形完全在画布内
    const x = Phaser.Math.Between(hexSize + 10, config.width - hexSize - 10);
    const y = Phaser.Math.Between(hexSize + 10, config.height - hexSize - 10);
    
    // 绘制六边形
    drawHexagon(graphics, x, y, hexSize);
  }
}

/**
 * 绘制正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 * @param {number} size - 六边形大小（中心到顶点的距离）
 */
function drawHexagon(graphics, x, y, size) {
  graphics.beginPath();
  
  // 计算六边形的6个顶点坐标
  // 从顶部开始，顺时针绘制
  for (let i = 0; i < 6; i++) {
    // 每个顶点的角度（60度间隔，从-90度开始使顶点朝上）
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const vertexX = x + size * Math.cos(angle);
    const vertexY = y + size * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(vertexX, vertexY);
    } else {
      graphics.lineTo(vertexX, vertexY);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
}

// 创建游戏实例
new Phaser.Game(config);