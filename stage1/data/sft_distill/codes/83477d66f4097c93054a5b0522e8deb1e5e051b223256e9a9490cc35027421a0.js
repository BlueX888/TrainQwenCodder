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
  // 记录星形初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建绿色星形纹理
  const graphics = this.add.graphics();
  createStarTexture(graphics, 'greenStar', 0x00ff00);
  
  // 创建黄色星形纹理（拖拽时使用）
  createStarTexture(graphics, 'yellowStar', 0xffff00);
  
  // 销毁 graphics 对象，纹理已生成
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'greenStar');
  star.setScale(1.5);
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowStar');
    // 提升层级
    this.setDepth(1);
  });
  
  // 监听拖拽中事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复绿色
    this.setTexture('greenStar');
    // 恢复层级
    this.setDepth(0);
    
    // 使用 Tween 动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

// 辅助函数：创建星形纹理
function createStarTexture(graphics, key, color) {
  graphics.clear();
  graphics.fillStyle(color, 1);
  
  // 计算星形的点
  const points = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius
    });
  }
  
  // 绘制星形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture(key, 100, 100);
}

new Phaser.Game(config);