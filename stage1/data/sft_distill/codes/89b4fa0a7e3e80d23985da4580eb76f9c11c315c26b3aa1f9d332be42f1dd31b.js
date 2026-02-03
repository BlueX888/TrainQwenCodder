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
  const centerX = 400;
  const centerY = 300;
  const hexRadius = 60;
  
  // 创建红色六边形纹理
  const graphics = this.add.graphics();
  createHexagonTexture(graphics, hexRadius, 0xff0000, 'hexRed');
  
  // 创建蓝色六边形纹理（拖拽时使用）
  createHexagonTexture(graphics, hexRadius, 0x0000ff, 'hexBlue');
  
  // 清除 graphics 对象
  graphics.clear();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(centerX, centerY, 'hexRed');
  
  // 保存初始位置
  hexagon.initialX = centerX;
  hexagon.initialY = centerY;
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive();
  this.input.setDraggable(hexagon);
  
  // 监听拖拽开始事件
  hexagon.on(Phaser.Input.Events.DRAG_START, function(pointer) {
    // 拖拽时改变为蓝色
    this.setTexture('hexBlue');
  });
  
  // 监听拖拽事件
  hexagon.on(Phaser.Input.Events.DRAG, function(pointer, dragX, dragY) {
    // 更新六边形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on(Phaser.Input.Events.DRAG_END, function(pointer) {
    // 恢复红色
    this.setTexture('hexRed');
    
    // 回到初始位置（使用补间动画使过渡更平滑）
    this.scene.tweens.add({
      targets: this,
      x: this.initialX,
      y: this.initialY,
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
 * @param {number} radius - 六边形半径
 * @param {number} color - 填充颜色
 * @param {string} key - 纹理键名
 */
function createHexagonTexture(graphics, radius, color, key) {
  graphics.clear();
  graphics.fillStyle(color, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 绘制六边形（6个顶点）
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  const size = radius * 2 + 10; // 添加一些边距
  graphics.generateTexture(key, size, size);
}

new Phaser.Game(config);