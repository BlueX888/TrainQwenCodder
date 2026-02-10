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
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius)
    // x, y: 星形中心坐标
    // points: 星形角的数量（5个角）
    // innerRadius: 内半径（20像素，使总大小为80像素）
    // outerRadius: 外半径（40像素，使总大小为80像素）
    graphics.fillStar(pointer.x, pointer.y, 5, 20, 40);
    
    // 完成绘制路径
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成星形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);