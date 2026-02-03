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
  // 无需预加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建48x48的红色矩形
    // 使用 Rectangle GameObject，原点在中心
    const rect = this.add.rectangle(
      pointer.x,      // x 坐标
      pointer.y,      // y 坐标
      48,             // 宽度
      48,             // 高度
      0xff0000        // 红色填充
    );
    
    // 可选：添加一些视觉反馈
    rect.setStrokeStyle(2, 0xffffff, 0.5);
  });
  
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成红色矩形', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);