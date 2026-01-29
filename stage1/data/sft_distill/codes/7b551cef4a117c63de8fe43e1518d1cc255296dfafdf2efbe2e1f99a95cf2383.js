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
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制矩形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为红色
    graphics.fillStyle(0xff0000, 1);
    
    // 在点击位置绘制48x48的矩形
    // 将矩形中心对齐到点击位置，所以需要减去矩形宽高的一半
    graphics.fillRect(
      pointer.x - 24,  // x坐标 - 宽度的一半
      pointer.y - 24,  // y坐标 - 高度的一半
      48,              // 宽度
      48               // 高度
    );
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a red square', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);