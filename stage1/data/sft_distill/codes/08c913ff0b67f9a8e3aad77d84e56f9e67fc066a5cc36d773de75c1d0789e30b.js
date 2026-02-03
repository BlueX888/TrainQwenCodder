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
  
  // 创建紫色三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制紫色三角形
  graphics.fillStyle(0x9966ff, 1);
  graphics.fillTriangle(
    50, 10,   // 顶点
    10, 90,   // 左下
    90, 90    // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'triangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 改变颜色
  triangle.on('dragstart', function(pointer) {
    // 创建亮紫色三角形纹理
    const dragGraphics = this.scene.add.graphics();
    dragGraphics.fillStyle(0xcc99ff, 1);
    dragGraphics.fillTriangle(50, 10, 10, 90, 90, 90);
    dragGraphics.generateTexture('triangleDrag', 100, 100);
    dragGraphics.destroy();
    
    // 切换纹理
    this.setTexture('triangleDrag');
  });
  
  // 监听拖拽事件 - 更新位置
  triangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复颜色和位置
  triangle.on('dragend', function(pointer) {
    // 恢复原始纹理
    this.setTexture('triangle');
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);