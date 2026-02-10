const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
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
    
    // 在点击位置绘制 16x16 的矩形
    // 矩形左上角位置为 (pointer.x - 8, pointer.y - 8)，使矩形中心对齐点击点
    graphics.fillRect(pointer.x - 8, pointer.y - 8, 16, 16);
  });
}

new Phaser.Game(config);