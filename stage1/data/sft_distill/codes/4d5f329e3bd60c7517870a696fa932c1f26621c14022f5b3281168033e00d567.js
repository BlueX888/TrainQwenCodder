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
  // 无需预加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建48x48的红色矩形
    // 使用 Rectangle 游戏对象，中心点对齐点击位置
    const rect = this.add.rectangle(
      pointer.x,      // x 坐标
      pointer.y,      // y 坐标
      48,             // 宽度
      48,             // 高度
      0xff0000        // 红色填充
    );
    
    // 可选：添加轻微的透明度使重叠效果更明显
    rect.setAlpha(0.9);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create red squares', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);