const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = 400;
  const centerY = 300;
  const hexRadius = 60;
  
  // 创建灰色六边形纹理
  const graphics = this.add.graphics();
  createHexagonTexture(graphics, hexRadius, 0x808080, 'hexGray');
  
  // 创建蓝色六边形纹理（拖拽时使用）
  createHexagonTexture(graphics, hexRadius, 0x4080ff, 'hexBlue');
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(centerX, centerY, 'hexGray');
  
  // 保存初始位置
  hexagon.initialX = centerX;
  hexagon.initialY = centerY;
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', function(pointer) {
    this.setTexture('hexBlue');
  });
  
  // 监听拖拽中事件
  hexagon.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', function(pointer) {
    this.setTexture('hexGray');
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: this.initialX,
      y: this.initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 辅助函数：创建六边形纹理
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