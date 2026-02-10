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
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制星形
    const graphics = this.add.graphics();
    
    // 设置蓝色填充
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius, rotation)
    // 64像素指外半径，内半径设为外半径的40%以形成标准星形
    const outerRadius = 32; // 总尺寸64像素，半径32
    const innerRadius = outerRadius * 0.4;
    const points = 5; // 五角星
    
    graphics.fillStar(
      pointer.x,      // x坐标（点击位置）
      pointer.y,      // y坐标（点击位置）
      points,         // 星形顶点数
      innerRadius,    // 内半径
      outerRadius,    // 外半径
      0               // 旋转角度
    );
    
    // 完成绘制
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create blue stars', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);