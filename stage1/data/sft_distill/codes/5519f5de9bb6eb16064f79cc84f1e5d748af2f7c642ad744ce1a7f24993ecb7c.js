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
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充样式 (紫色: 0x800080 或 0x9932cc)
    graphics.fillStyle(0x800080, 1);
    
    // 在点击位置绘制半径为 40 像素的圆形（直径 80 像素）
    graphics.fillCircle(pointer.x, pointer.y, 40);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成紫色圆形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);