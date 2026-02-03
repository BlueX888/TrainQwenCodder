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
  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const hexColor = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
    
    // 创建六边形
    createHexagon(this, pointer.x, pointer.y, 30, hexColor);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画面生成六边形', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5);
}

/**
 * 创建六边形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - 中心 X 坐标
 * @param {number} y - 中心 Y 坐标
 * @param {number} radius - 半径
 * @param {number} color - 颜色值
 */
function createHexagon(scene, x, y, radius, color) {
  const graphics = scene.add.graphics();
  
  // 设置填充颜色和透明度
  graphics.fillStyle(color, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算六边形的 6 个顶点
  // 六边形从顶部开始，顺时针绘制
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始（-90度）
    const vx = x + radius * Math.cos(angle);
    const vy = y + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(vx, vy);
    } else {
      graphics.lineTo(vx, vy);
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
  
  // 添加描边效果（可选）
  graphics.lineStyle(2, 0xffffff, 0.5);
  graphics.strokePath();
}

// 创建游戏实例
new Phaser.Game(config);