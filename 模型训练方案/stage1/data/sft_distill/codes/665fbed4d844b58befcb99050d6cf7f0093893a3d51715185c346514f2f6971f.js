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
}

/**
 * 在指定位置创建一个粉色六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心X坐标
 * @param {number} y - 中心Y坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xFF69B4, 1); // 粉色 (HotPink)
  
  // 六边形参数
  const radius = 32; // 半径32像素，直径64像素
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并连接六边形的6个顶点
  for (let i = 0; i < sides; i++) {
    // 从顶部开始（-90度），顺时针绘制
    const vertexAngle = angle * i - Math.PI / 2;
    const vx = x + Math.cos(vertexAngle) * radius;
    const vy = y + Math.sin(vertexAngle) * radius;
    
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
}

new Phaser.Game(config);