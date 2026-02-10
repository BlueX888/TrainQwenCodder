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
    // 创建 Graphics 对象用于绘制星形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为灰色
    graphics.fillStyle(0x808080, 1);
    
    // 绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius, fillColor)
    // 64像素大小，使用外半径32，内半径16
    graphics.fillStar(pointer.x, pointer.y, 5, 16, 32);
    
    // 填充路径
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a gray star', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);