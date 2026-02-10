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
  
  // 创建青色六边形纹理
  const graphics = this.add.graphics();
  createHexagonTexture(graphics, 'hexagonCyan', 0x00ffff);
  
  // 创建黄色六边形纹理（拖拽时使用）
  createHexagonTexture(graphics, 'hexagonYellow', 0xffff00);
  
  // 清理 graphics 对象
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexagonCyan');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('hexagonYellow');
    // 提升层级
    this.setDepth(1);
  });
  
  // 监听拖拽事件
  hexagon.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('hexagonCyan');
    // 恢复层级
    this.setDepth(0);
    
    // 使用缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

/**
 * 创建六边形纹理
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {string} key - 纹理键名
 * @param {number} color - 颜色值
 */
function createHexagonTexture(graphics, key, color) {
  const size = 60; // 六边形大小
  const centerX = 64; // 纹理中心 X
  const centerY = 64; // 纹理中心 Y
  
  graphics.clear();
  graphics.fillStyle(color, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  // 绘制六边形（6个顶点）
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 每个角60度，从-30度开始
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    
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
  graphics.generateTexture(key, 128, 128);
}

new Phaser.Game(config);