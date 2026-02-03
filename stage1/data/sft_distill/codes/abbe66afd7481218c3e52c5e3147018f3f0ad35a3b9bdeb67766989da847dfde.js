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
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建灰色六边形纹理
  const graphics = this.add.graphics();
  createHexagonTexture(graphics, 'hexagonGray', 0x808080);
  
  // 创建亮色六边形纹理（拖拽时使用）
  createHexagonTexture(graphics, 'hexagonBright', 0x00ff00);
  
  // 清理 graphics 对象
  graphics.clear();
  
  // 创建六边形 Sprite
  const hexagon = this.add.sprite(initialX, initialY, 'hexagonGray');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  hexagon.on(Phaser.Input.Events.DRAG_START, (pointer, dragX, dragY) => {
    // 改变为亮色
    hexagon.setTexture('hexagonBright');
  });
  
  // 监听拖拽事件
  hexagon.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    // 更新六边形位置
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on(Phaser.Input.Events.DRAG_END, (pointer, dragX, dragY) => {
    // 恢复灰色
    hexagon.setTexture('hexagonGray');
    
    // 回到初始位置（添加缓动动画）
    this.tweens.add({
      targets: hexagon,
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
 * 创建六边形纹理
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {string} key - 纹理键名
 * @param {number} color - 填充颜色
 */
function createHexagonTexture(graphics, key, color) {
  graphics.clear();
  
  const size = 50; // 六边形大小
  const centerX = 60;
  const centerY = 60;
  
  // 绘制六边形（6个顶点）
  graphics.fillStyle(color, 1);
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度 60 度
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
  
  // 添加边框
  graphics.lineStyle(3, 0xffffff, 0.8);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture(key, 120, 120);
}

new Phaser.Game(config);