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
  
  // 创建紫色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x8b4789, 1); // 紫色
  graphics.fillTriangle(
    50, 10,   // 顶点
    10, 90,   // 左下角
    90, 90    // 右下角
  );
  graphics.generateTexture('purpleTriangle', 100, 100);
  graphics.destroy();
  
  // 创建亮紫色三角形纹理（拖拽时使用）
  const graphicsLight = this.add.graphics();
  graphicsLight.fillStyle(0xda70d6, 1); // 亮紫色
  graphicsLight.fillTriangle(
    50, 10,
    10, 90,
    90, 90
  );
  graphicsLight.generateTexture('lightPurpleTriangle', 100, 100);
  graphicsLight.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'purpleTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 添加提示文本
  const hint = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为亮紫色
    this.setTexture('lightPurpleTriangle');
    // 增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复原始颜色
    this.setTexture('purpleTriangle');
    // 恢复原始缩放
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