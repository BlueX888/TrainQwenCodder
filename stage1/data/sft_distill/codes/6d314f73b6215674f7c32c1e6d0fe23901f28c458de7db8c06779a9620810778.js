const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建红色方块
    // 使用 Graphics 绘制 64x64 的红色方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色，不透明
    
    // 以点击位置为中心绘制方块（64x64）
    // 减去32使方块中心对齐点击位置
    graphics.fillRect(pointer.x - 32, pointer.y - 32, 64, 64);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create red squares', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);