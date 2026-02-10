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
  
  // 创建粉色三角形纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillTriangle(
    0, -40,    // 顶点
    -35, 40,   // 左下
    35, 40     // 右下
  );
  pinkGraphics.generateTexture('pinkTriangle', 70, 80);
  pinkGraphics.destroy();
  
  // 创建蓝色三角形纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4169e1, 1); // 蓝色
  blueGraphics.fillTriangle(
    0, -40,
    -35, 40,
    35, 40
  );
  blueGraphics.generateTexture('blueTriangle', 70, 80);
  blueGraphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'pinkTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueTriangle');
    // 增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽中事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复粉色
    this.setTexture('pinkTriangle');
    // 恢复缩放
    this.setScale(1);
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加悬停效果
  triangle.on('pointerover', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1.05);
    }
  });
  
  triangle.on('pointerout', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1);
    }
  });
}

new Phaser.Game(config);