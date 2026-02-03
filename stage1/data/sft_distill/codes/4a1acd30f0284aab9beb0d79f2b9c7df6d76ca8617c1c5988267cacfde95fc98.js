const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  const diamondSize = 48; // 菱形大小
  const halfSize = diamondSize / 2; // 菱形半径
  
  // 绘制8个随机位置的粉色菱形
  for (let i = 0; i < 8; i++) {
    // 生成随机位置（确保菱形完全在画布内）
    const x = Phaser.Math.Between(halfSize, this.scale.width - halfSize);
    const y = Phaser.Math.Between(halfSize, this.scale.height - halfSize);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充
    graphics.fillStyle(0xff69b4, 1);
    
    // 定义菱形的4个顶点（相对于中心点）
    const points = [
      new Phaser.Geom.Point(0, -halfSize),      // 上顶点
      new Phaser.Geom.Point(halfSize, 0),       // 右顶点
      new Phaser.Geom.Point(0, halfSize),       // 下顶点
      new Phaser.Geom.Point(-halfSize, 0)       // 左顶点
    ];
    
    // 绘制填充的菱形
    graphics.fillPoints(points, true);
    
    // 设置菱形位置
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);