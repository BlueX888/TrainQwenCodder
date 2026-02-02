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
  this.add.text(400, 300, '点击画布生成粉色六边形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建一个粉色六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 六边形半径（外接圆半径）
  const radius = 16; // 32像素直径，半径16
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算六边形的6个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    // 角度：从-90度开始（顶部），每次增加60度
    const angle = (Math.PI / 180) * (i * 60 - 90);
    const pointX = x + radius * Math.cos(angle);
    const pointY = y + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(pointX, pointY);
    } else {
      graphics.lineTo(pointX, pointY);
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);