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
    // 创建 Graphics 对象用于绘制圆形
    const graphics = this.add.graphics();
    
    // 设置紫色填充样式 (0x800080 是紫色的十六进制值)
    graphics.fillStyle(0x800080, 1);
    
    // 在点击位置绘制半径为40像素的圆形（直径80像素）
    // fillCircle(x, y, radius)
    graphics.fillCircle(pointer.x, pointer.y, 40);
  });
  
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成紫色圆形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);