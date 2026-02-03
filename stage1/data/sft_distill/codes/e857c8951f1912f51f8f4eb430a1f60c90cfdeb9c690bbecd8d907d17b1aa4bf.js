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
    createHexagon(this, pointer.x, pointer.y);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 30, '点击画布任意位置生成粉色六边形', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);
}

/**
 * 在指定位置创建一个六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置粉色填充 (pink: #FF69B4)
  graphics.fillStyle(0xFF69B4, 1);
  
  // 六边形参数
  const radius = 32; // 半径32像素，直径64像素
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算第一个顶点（从正上方开始，即-90度位置）
  const startAngle = -Math.PI / 2;
  graphics.moveTo(
    x + radius * Math.cos(startAngle),
    y + radius * Math.sin(startAngle)
  );
  
  // 绘制其余5个顶点
  for (let i = 1; i <= sides; i++) {
    const currentAngle = startAngle + angle * i;
    graphics.lineTo(
      x + radius * Math.cos(currentAngle),
      y + radius * Math.sin(currentAngle)
    );
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充六边形
  graphics.fillPath();
}

// 启动游戏
new Phaser.Game(config);