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
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建六边形
    createHexagon(this, pointer.x, pointer.y, 32);
  });

  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create pink hexagons', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

/**
 * 创建六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心X坐标
 * @param {number} y - 中心Y坐标
 * @param {number} size - 六边形大小（外接圆半径）
 */
function createHexagon(scene, x, y, size) {
  const graphics = scene.add.graphics();
  
  // 设置粉色填充 (0xFFC0CB 是粉色的十六进制值)
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算六边形的6个顶点
  // 六边形顶点角度：从30度开始，每隔60度一个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (30 + i * 60); // 转换为弧度
    const vx = x + size * Math.cos(angle);
    const vy = y + size * Math.sin(angle);
    
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