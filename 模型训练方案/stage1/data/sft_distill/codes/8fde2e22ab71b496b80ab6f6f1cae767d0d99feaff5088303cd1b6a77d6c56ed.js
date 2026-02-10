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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象
  hexagon = this.add.graphics();
  
  // 设置六边形的中心位置
  hexagon.x = 400;
  hexagon.y = 300;
  
  // 绘制六边形
  drawHexagon(hexagon, 0, 0, 80);
}

function update(time, delta) {
  // 每秒旋转80度
  // delta 是毫秒，转换为秒：delta / 1000
  // 80度转换为弧度：80 * Math.PI / 180
  const rotationSpeed = (80 * Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 更新旋转角度
  hexagon.rotation += rotationDelta;
}

/**
 * 绘制六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} centerX - 中心X坐标（相对于 graphics 对象）
 * @param {number} centerY - 中心Y坐标（相对于 graphics 对象）
 * @param {number} radius - 六边形半径
 */
function drawHexagon(graphics, centerX, centerY, radius) {
  // 设置填充颜色
  graphics.fillStyle(0x00ff88, 1);
  
  // 开始路径
  graphics.beginPath();
  
  // 计算六边形的6个顶点
  // 六边形每个角度间隔 60 度（2π/6）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
  
  // 可选：添加描边使六边形更明显
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
}

new Phaser.Game(config);