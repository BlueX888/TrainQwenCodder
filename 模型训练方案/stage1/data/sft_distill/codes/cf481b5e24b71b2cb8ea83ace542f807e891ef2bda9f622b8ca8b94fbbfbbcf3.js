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
    createHexagon(this, pointer.x, pointer.y);
  });

  // 显示提示文本
  this.add.text(400, 300, '点击任意位置生成六边形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建橙色六边形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 六边形半径（24像素直径，半径12像素）
  const radius = 12;
  
  // 计算正六边形的6个顶点坐标
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始，每60度一个顶点
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(px, py);
  }
  
  // 设置填充颜色为橙色
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);