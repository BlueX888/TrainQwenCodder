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
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为灰色
    graphics.fillStyle(0x808080, 1);
    
    // 获取点击位置
    const x = pointer.x;
    const y = pointer.y;
    
    // 菱形大小为16像素，半径为8像素
    const size = 8;
    
    // 绘制菱形（四个顶点：上、右、下、左）
    graphics.beginPath();
    graphics.moveTo(x, y - size);        // 上顶点
    graphics.lineTo(x + size, y);        // 右顶点
    graphics.lineTo(x, y + size);        // 下顶点
    graphics.lineTo(x - size, y);        // 左顶点
    graphics.closePath();
    graphics.fillPath();
  });
}

new Phaser.Game(config);