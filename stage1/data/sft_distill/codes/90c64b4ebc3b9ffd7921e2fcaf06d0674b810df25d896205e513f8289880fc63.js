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
  // 注册点击事件
  this.input.on('pointerdown', (pointer) => {
    createHexagon(this, pointer.x, pointer.y);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击任意位置生成粉色六边形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心点 X 坐标
 * @param {number} y - 中心点 Y 坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1); // 粉色 (hotpink)
  
  // 六边形半径（从中心到顶点的距离）
  const radius = 32; // 64像素直径，半径32
  
  // 计算六边形的六个顶点坐标
  // 六边形顶点角度：0°, 60°, 120°, 180°, 240°, 300°
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始，逆时针
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push({ x: px, y: py });
  }
  
  // 绘制六边形路径
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);