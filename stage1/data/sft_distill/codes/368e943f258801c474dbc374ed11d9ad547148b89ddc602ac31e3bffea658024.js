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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制8个随机位置的圆形
  for (let i = 0; i < 8; i++) {
    // 生成随机坐标，确保圆形完全在画布内
    // 留出半径(8像素)的边距，避免圆形被裁剪
    const x = Math.random() * (this.scale.width - 16) + 8;
    const y = Math.random() * (this.scale.height - 16) + 8;
    
    // 绘制圆形，半径为8像素(直径16像素)
    graphics.fillCircle(x, y, 8);
  }
}

new Phaser.Game(config);