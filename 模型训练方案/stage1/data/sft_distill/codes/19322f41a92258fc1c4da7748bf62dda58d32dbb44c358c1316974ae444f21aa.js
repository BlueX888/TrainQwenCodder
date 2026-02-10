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
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制圆形
    const graphics = this.add.graphics();
    
    // 设置紫色填充样式 (紫色: 0x800080)
    graphics.fillStyle(0x800080, 1);
    
    // 在点击位置绘制半径为12像素的圆形（直径24像素）
    graphics.fillCircle(pointer.x, pointer.y, 12);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create purple circles', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

// 创建游戏实例
new Phaser.Game(config);