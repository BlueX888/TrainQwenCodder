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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制8个随机位置的圆形
  for (let i = 0; i < 8; i++) {
    // 生成随机坐标
    // 确保圆形完全在画布内（留出半径8的边距）
    const x = Math.random() * (800 - 16) + 8;
    const y = Math.random() * (600 - 16) + 8;
    
    // 绘制圆形，半径为8（直径16像素）
    graphics.fillCircle(x, y, 8);
  }
}

new Phaser.Game(config);