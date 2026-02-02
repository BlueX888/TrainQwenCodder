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
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建蓝色六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制蓝色六边形
  graphics.fillStyle(0x3498db, 1);
  const hexagonPoints = createHexagonPoints(0, 0, 60);
  graphics.fillPoints(hexagonPoints, true);
  graphics.generateTexture('hexagonBlue', 140, 140);
  graphics.clear();
  
  // 绘制红色六边形（拖拽时使用）
  graphics.fillStyle(0xe74c3c, 1);
  graphics.fillPoints(hexagonPoints, true);
  graphics.generateTexture('hexagonRed', 140, 140);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexagonBlue');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新位置
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    // 改变为红色
    gameObject.setTexture('hexagonRed');
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复蓝色
    gameObject.setTexture('hexagonBlue');
    
    // 回到初始位置（添加缓动效果）
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 创建六边形的顶点坐标
 * @param {number} centerX - 中心X坐标
 * @param {number} centerY - 中心Y坐标
 * @param {number} radius - 半径
 * @returns {Array} 顶点坐标数组
 */
function createHexagonPoints(centerX, centerY, radius) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle) + 70; // 偏移到纹理中心
    const y = centerY + radius * Math.sin(angle) + 70;
    points.push({ x, y });
  }
  return points;
}

new Phaser.Game(config);