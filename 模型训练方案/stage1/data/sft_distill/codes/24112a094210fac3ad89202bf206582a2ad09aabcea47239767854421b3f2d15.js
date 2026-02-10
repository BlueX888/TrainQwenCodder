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
  this.add.text(10, 10, 'Click anywhere to create cyan hexagons', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

/**
 * 在指定位置创建一个青色六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置青色填充（cyan）
  graphics.fillStyle(0x00ffff, 1);
  
  // 六边形参数
  const radius = 32; // 半径32像素，总大小64像素
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并连接六边形的6个顶点
  // 从顶部开始（-90度），顺时针绘制
  for (let i = 0; i < sides; i++) {
    const currentAngle = angle * i - Math.PI / 2; // -90度起始
    const px = x + Math.cos(currentAngle) * radius;
    const py = y + Math.sin(currentAngle) * radius;
    
    if (i === 0) {
      graphics.moveTo(px, py);
    } else {
      graphics.lineTo(px, py);
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充六边形
  graphics.fillPath();
  
  // 可选：添加描边使六边形更清晰
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
}

new Phaser.Game(config);