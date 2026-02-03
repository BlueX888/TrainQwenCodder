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
  // 无需预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  const hexRadius = 60;

  // 创建红色六边形纹理
  const graphics = this.add.graphics();
  createHexagonTexture(graphics, hexRadius, 0xff0000, 'hexRed');
  
  // 创建蓝色六边形纹理（用于拖拽时）
  createHexagonTexture(graphics, hexRadius, 0x0000ff, 'hexBlue');
  
  // 清除 graphics 对象
  graphics.clear();

  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexRed');
  
  // 设置交互和拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('hexBlue');
    // 提升层级
    this.setDepth(1);
  });
  
  // 监听拖拽事件
  hexagon.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', function(pointer) {
    // 恢复为红色
    this.setTexture('hexRed');
    // 恢复层级
    this.setDepth(0);
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 创建六边形纹理的辅助函数
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} radius - 六边形半径
 * @param {number} color - 填充颜色
 * @param {string} key - 纹理键名
 */
function createHexagonTexture(graphics, radius, color, key) {
  graphics.clear();
  graphics.fillStyle(color, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 绘制六边形路径
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
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
  graphics.generateTexture(key, radius * 2, radius * 2);
}

new Phaser.Game(config);