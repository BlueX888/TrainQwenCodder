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
    // 在点击位置创建80x80的绿色矩形
    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色，不透明
    
    // 以点击位置为中心绘制矩形（左上角坐标为 pointer.x - 40, pointer.y - 40）
    graphics.fillRect(pointer.x - 40, pointer.y - 40, 80, 80);
  });

  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成绿色矩形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);