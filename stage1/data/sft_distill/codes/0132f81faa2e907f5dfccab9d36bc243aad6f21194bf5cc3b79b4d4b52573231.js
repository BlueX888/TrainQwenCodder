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
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充样式为红色
    graphics.fillStyle(0xff0000, 1);
    
    // 在点击位置绘制 16x16 的矩形
    // 矩形中心对齐点击位置
    graphics.fillRect(pointer.x - 8, pointer.y - 8, 16, 16);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成红色矩形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);