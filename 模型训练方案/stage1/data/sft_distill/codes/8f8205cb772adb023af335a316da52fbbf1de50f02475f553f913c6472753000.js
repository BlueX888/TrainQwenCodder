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
  // 监听画布的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建64x64的红色方块
    // 使用 Graphics 绘制方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色，不透明
    
    // 以点击位置为中心绘制方块（减去32使方块中心对齐点击点）
    graphics.fillRect(pointer.x - 32, pointer.y - 32, 64, 64);
    
    console.log(`方块已生成在位置: (${pointer.x}, ${pointer.y})`);
  });
  
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成红色方块', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

// 创建游戏实例
new Phaser.Game(config);