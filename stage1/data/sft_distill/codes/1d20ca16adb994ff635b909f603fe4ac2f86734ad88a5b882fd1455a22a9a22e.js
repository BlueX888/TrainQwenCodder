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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式
  graphics.fillStyle(0xff69b4, 1);
  
  // 圆形半径（直径16像素，半径8像素）
  const radius = 8;
  
  // 绘制8个随机位置的圆形
  for (let i = 0; i < 8; i++) {
    // 生成随机坐标，确保圆形完全在画布内
    // x 范围: radius 到 (width - radius)
    // y 范围: radius 到 (height - radius)
    const x = Phaser.Math.Between(radius, this.scale.width - radius);
    const y = Phaser.Math.Between(radius, this.scale.height - radius);
    
    // 绘制圆形
    graphics.fillCircle(x, y, radius);
  }
}

new Phaser.Game(config);