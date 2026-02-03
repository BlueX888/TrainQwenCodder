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
  
  // 创建黄色三角形纹理（拖拽时使用）
  const yellowGraphics = this.add.graphics();
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillTriangle(
    0, -40,
    -35, 40,
    35, 40
  );
  yellowGraphics.generateTexture('yellowTriangle', 70, 80);
  yellowGraphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'pinkTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 添加拖拽提示文本
  const hintText = this.add.text(400, 100, '拖拽粉色三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowTriangle');
    // 增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽中事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
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
  
  // 添加鼠标悬停效果
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