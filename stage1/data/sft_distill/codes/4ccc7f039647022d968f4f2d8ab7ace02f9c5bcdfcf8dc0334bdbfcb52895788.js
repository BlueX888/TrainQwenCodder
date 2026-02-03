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
  // 不需要预加载外部资源
}

function create() {
  // 保存初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建蓝色六边形纹理
  const graphics = this.add.graphics();
  createHexagonTexture(graphics, 'hexBlue', 0x3498db);
  
  // 创建绿色六边形纹理（拖拽时使用）
  createHexagonTexture(graphics, 'hexGreen', 0x2ecc71);
  
  // 清除 graphics（已生成纹理）
  graphics.clear();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexBlue');
  hexagon.setScale(1.5);
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为绿色
    gameObject.setTexture('hexGreen');
    // 可选：增加缩放效果
    gameObject.setScale(1.7);
  });
  
  // 监听拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复蓝色
    gameObject.setTexture('hexBlue');
    // 恢复原始缩放
    gameObject.setScale(1.5);
    
    // 使用补间动画回到初始位置
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
 * 创建六边形纹理
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {string} key - 纹理键名
 * @param {number} color - 填充颜色
 */
function createHexagonTexture(graphics, key, color) {
  const size = 50; // 六边形大小
  const points = [];
  
  // 计算六边形的六个顶点（正六边形）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
    const x = size + Math.cos(angle) * size;
    const y = size + Math.sin(angle) * size;
    points.push({ x, y });
  }
  
  // 绘制六边形
  graphics.fillStyle(color, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使六边形更明显
  graphics.lineStyle(3, 0xffffff, 0.8);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture(key, size * 2, size * 2);
  graphics.clear();
}

new Phaser.Game(config);