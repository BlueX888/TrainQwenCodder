const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建48x48的红色矩形
    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色，不透明
    
    // 以点击位置为中心绘制矩形（左上角坐标需要偏移24像素）
    graphics.fillRect(pointer.x - 24, pointer.y - 24, 48, 48);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create red squares', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);