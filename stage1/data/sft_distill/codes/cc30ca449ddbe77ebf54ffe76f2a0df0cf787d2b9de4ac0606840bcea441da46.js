const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建80x80的绿色矩形
    const rect = this.add.rectangle(
      pointer.x,      // x 坐标
      pointer.y,      // y 坐标
      80,             // 宽度
      80,             // 高度
      0x00ff00        // 绿色填充
    );
    
    // 可选：添加轻微透明度使重叠效果更明显
    rect.setAlpha(0.8);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create green rectangles', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);