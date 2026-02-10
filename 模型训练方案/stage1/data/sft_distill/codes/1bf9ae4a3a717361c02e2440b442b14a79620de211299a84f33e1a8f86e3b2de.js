const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 星形参数
  const starSize = 80; // 星形大小（外半径）
  const starCount = 12; // 星形数量
  const purpleColor = 0x9b59b6; // 紫色
  
  // 绘制12个随机位置的星形
  for (let i = 0; i < starCount; i++) {
    // 生成随机位置（考虑星形大小，避免超出边界）
    const x = Phaser.Math.Between(starSize / 2, config.width - starSize / 2);
    const y = Phaser.Math.Between(starSize / 2, config.height - starSize / 2);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为紫色
    graphics.fillStyle(purpleColor, 1);
    
    // 创建星形几何体
    // 参数：x, y, 角的数量, 内半径, 外半径
    const star = new Phaser.Geom.Star(
      x,           // 中心 x 坐标
      y,           // 中心 y 坐标
      5,           // 5个角
      starSize / 4, // 内半径（外半径的1/4）
      starSize / 2  // 外半径（星形大小的一半）
    );
    
    // 填充星形路径
    graphics.fillPoints(star.points, true);
  }
}

new Phaser.Game(config);