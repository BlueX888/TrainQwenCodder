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
  // 粉色的十六进制颜色值
  const pinkColor = 0xff69b4;
  
  // 创建 8 个粉色圆形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置填充颜色为粉色
    circle.fillStyle(pinkColor, 1);
    
    // 绘制圆形，圆心在 (0, 0)，半径为 8（直径 16）
    circle.fillCircle(0, 0, 8);
    
    // 设置随机位置
    // 确保圆形完全在画布内（留出半径的边距）
    const x = Phaser.Math.Between(8, 800 - 8);
    const y = Phaser.Math.Between(8, 600 - 8);
    circle.setPosition(x, y);
  }
}

new Phaser.Game(config);