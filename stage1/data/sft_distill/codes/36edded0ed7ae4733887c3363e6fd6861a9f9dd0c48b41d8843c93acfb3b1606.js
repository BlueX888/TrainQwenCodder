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
  
  // 设置红色填充
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制20个随机位置的六边形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置（留出边距避免六边形被裁剪）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 六边形半径（24像素指的是外接圆半径）
    const radius = 24;
    
    // 绘制六边形
    drawHexagon(graphics, x, y, radius);
  }
}

/**
 * 绘制一个正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 * @param {number} radius - 外接圆半径
 */
function drawHexagon(graphics, x, y, radius) {
  graphics.beginPath();
  
  // 计算六边形的6个顶点
  // 从顶部开始，逆时针绘制（起始角度为 -90 度）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 60度间隔，起始于顶部
    const vx = x + radius * Math.cos(angle);
    const vy = y + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(vx, vy);
    } else {
      graphics.lineTo(vx, vy);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
}

// 启动游戏
new Phaser.Game(config);