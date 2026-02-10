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
  this.add.text(400, 300, '点击画布任意位置生成六边形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建一个青色六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 六边形参数
  const radius = 32; // 半径32像素，总直径64像素
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  // 计算六边形的6个顶点坐标
  const points = [];
  for (let i = 0; i < sides; i++) {
    // 从顶部开始绘制（-Math.PI/2 让第一个顶点在正上方）
    const vertexAngle = angle * i - Math.PI / 2;
    const px = x + radius * Math.cos(vertexAngle);
    const py = y + radius * Math.sin(vertexAngle);
    points.push(px, py);
  }
  
  // 设置填充颜色为青色 (cyan)
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 可选：添加描边使六边形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
}

new Phaser.Game(config);