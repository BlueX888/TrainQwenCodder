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
  // 添加提示文本
  this.add.text(400, 50, '点击画布任意位置生成绿色矩形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 使用 Graphics 绘制80x80的绿色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色，不透明
    
    // 以点击位置为中心绘制矩形
    // fillRect 参数：x, y, width, height
    // 需要将中心点偏移，使矩形中心对齐点击位置
    graphics.fillRect(pointer.x - 40, pointer.y - 40, 80, 80);
    
    // 可选：添加边框使矩形更明显
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(pointer.x - 40, pointer.y - 40, 80, 80);
  });
}

new Phaser.Game(config);