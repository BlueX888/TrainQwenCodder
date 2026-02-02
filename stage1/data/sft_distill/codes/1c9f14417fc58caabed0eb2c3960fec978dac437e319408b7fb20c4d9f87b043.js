const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  const diamondSize = 48; // 菱形大小
  const halfSize = diamondSize / 2;
  
  // 绘制8个随机位置的粉色菱形
  for (let i = 0; i < 8; i++) {
    const graphics = this.add.graphics();
    
    // 设置粉色填充
    graphics.fillStyle(0xFF69B4, 1); // 粉色 (HotPink)
    
    // 创建菱形路径
    // 菱形是一个旋转45度的正方形，四个顶点分别在上下左右
    const path = new Phaser.Geom.Path();
    path.moveTo(0, -halfSize);        // 顶部顶点
    path.lineTo(halfSize, 0);         // 右侧顶点
    path.lineTo(0, halfSize);         // 底部顶点
    path.lineTo(-halfSize, 0);        // 左侧顶点
    path.closePath();                 // 闭合路径
    
    // 绘制并填充路径
    path.draw(graphics);
    graphics.fillPath();
    
    // 设置随机位置
    // 确保菱形完全在画布内（留出边距）
    const margin = halfSize;
    graphics.setRandomPosition(
      margin,
      margin,
      config.width - margin * 2,
      config.height - margin * 2
    );
  }
}

new Phaser.Game(config);