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
    // 创建 Graphics 对象用于绘制圆形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为灰色（0x808080）
    graphics.fillStyle(0x808080, 1);
    
    // 在点击位置绘制圆形，半径为16像素（直径32像素）
    graphics.fillCircle(pointer.x, pointer.y, 16);
  });
}

new Phaser.Game(config);