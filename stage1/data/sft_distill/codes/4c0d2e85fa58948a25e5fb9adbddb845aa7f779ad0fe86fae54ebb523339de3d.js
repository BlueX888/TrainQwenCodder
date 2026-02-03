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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1); // 蓝色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100); // 生成 100x100 的纹理
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建可拖拽的圆形精灵
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 设置为可交互并启用拖拽
  circle.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件 - 放大到 1.2 倍
  circle.on('dragstart', function(pointer, dragX, dragY) {
    this.setScale(1.2);
  });

  // 监听拖拽事件 - 更新位置
  circle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复原始大小
  circle.on('dragend', function(pointer, dragX, dragY) {
    this.setScale(1);
  });

  // 添加鼠标悬停效果（可选，增强交互体验）
  circle.on('pointerover', function() {
    if (this.scale === 1) { // 只在非拖拽状态下改变光标
      this.scene.input.setDefaultCursor('pointer');
    }
  });

  circle.on('pointerout', function() {
    this.scene.input.setDefaultCursor('default');
  });
}

new Phaser.Game(config);