const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建紫色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillTriangle(
    64, 20,   // 顶点
    20, 108,  // 左下
    108, 108  // 右下
  );
  graphics.generateTexture('trianglePurple', 128, 128);
  graphics.destroy();

  // 创建浅紫色三角形纹理（拖拽时使用）
  const graphicsLight = this.add.graphics();
  graphicsLight.fillStyle(0xd8bfd8, 1); // 浅紫色
  graphicsLight.fillTriangle(
    64, 20,
    20, 108,
    108, 108
  );
  graphicsLight.generateTexture('triangleLight', 128, 128);
  graphicsLight.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'trianglePurple');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });

  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  triangle.on('dragstart', (pointer) => {
    // 改变为浅紫色
    triangle.setTexture('triangleLight');
    // 放大效果
    triangle.setScale(1.1);
    hintText.setText('拖拽中...');
  });

  // 监听拖拽事件
  triangle.on('drag', (pointer, dragX, dragY) => {
    // 更新三角形位置
    triangle.x = dragX;
    triangle.y = dragY;
  });

  // 监听拖拽结束事件
  triangle.on('dragend', (pointer) => {
    // 恢复原始颜色
    triangle.setTexture('trianglePurple');
    // 恢复原始大小
    triangle.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: triangle,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });

    hintText.setText('已回到初始位置');
    
    // 2秒后恢复提示文本
    this.time.delayedCall(2000, () => {
      hintText.setText('拖拽三角形试试！');
    });
  });

  // 添加鼠标悬停效果
  triangle.on('pointerover', () => {
    triangle.setScale(1.05);
  });

  triangle.on('pointerout', () => {
    if (!triangle.input.isDragging) {
      triangle.setScale(1);
    }
  });
}

new Phaser.Game(config);