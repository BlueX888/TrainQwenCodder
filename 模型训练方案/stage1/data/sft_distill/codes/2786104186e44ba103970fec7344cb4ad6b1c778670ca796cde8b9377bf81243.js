const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制圆形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为灰色 (0x808080)
    graphics.fillStyle(0x808080, 1);
    
    // 在点击位置绘制圆形，半径为24像素（直径48像素）
    graphics.fillCircle(pointer.x, pointer.y, 24);
  });
  
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成灰色圆形', {
    fontSize: '16px',
    color: '#000000'
  });
}

// 创建游戏实例
new Phaser.Game(config);