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
  // 无需预加载外部资源
}

function create() {
  // 监听画布的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制星形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius)
    // 80像素指的是星形的外半径，内半径设为外半径的40%
    const outerRadius = 40; // 半径40像素，直径80像素
    const innerRadius = outerRadius * 0.4;
    const points = 5; // 五角星
    
    graphics.fillStar(pointer.x, pointer.y, points, innerRadius, outerRadius);
    
    // 完成绘制
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成黄色星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);