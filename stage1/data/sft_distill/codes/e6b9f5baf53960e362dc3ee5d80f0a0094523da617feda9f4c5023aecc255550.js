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
  // 监听画布的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制星形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为灰色
    graphics.fillStyle(0x808080, 1);
    
    // 绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius, rotation)
    // 64像素指外径，内径取外径的一半
    const outerRadius = 32; // 64像素直径，半径32
    const innerRadius = 16; // 内半径为外半径的一半
    const points = 5; // 五角星
    
    graphics.fillStar(
      pointer.x,      // 星形中心 x 坐标
      pointer.y,      // 星形中心 y 坐标
      points,         // 星形的角数
      innerRadius,    // 内半径
      outerRadius,    // 外半径
      0               // 旋转角度
    );
    
    // 可选：添加描边使星形更明显
    graphics.lineStyle(2, 0x666666, 1);
    graphics.strokeStar(
      pointer.x,
      pointer.y,
      points,
      innerRadius,
      outerRadius,
      0
    );
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a star', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);