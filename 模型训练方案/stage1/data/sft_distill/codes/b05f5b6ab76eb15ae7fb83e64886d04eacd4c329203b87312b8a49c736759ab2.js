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
  // 监听画布上的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制星形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为橙色
    graphics.fillStyle(0xFFA500, 1);
    
    // 在点击位置绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius)
    // 5个角的星形，内半径8像素，外半径16像素
    graphics.fillStar(pointer.x, pointer.y, 5, 8, 16);
    
    // 填充路径
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create orange stars!', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);