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
    
    // 设置填充颜色为橙色
    graphics.fillStyle(0xFFA500, 1);
    
    // 在点击位置绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius)
    // 64像素指的是外半径，内半径设为外半径的一半
    const outerRadius = 32; // 64像素直径，半径为32
    const innerRadius = 16; // 内半径为外半径的一半
    const points = 5; // 5个角的星形
    
    graphics.fillStar(
      pointer.x,
      pointer.y,
      points,
      innerRadius,
      outerRadius
    );
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create orange stars!', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);