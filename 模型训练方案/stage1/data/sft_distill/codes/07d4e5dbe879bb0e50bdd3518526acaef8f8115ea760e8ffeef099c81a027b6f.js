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
  // 本示例不需要预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制矩形
  const graphics = this.add.graphics();
  
  // 设置粉色填充颜色
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制10个随机位置的矩形
  for (let i = 0; i < 10; i++) {
    // 生成随机 x 坐标（确保矩形完全在画布内）
    const randomX = Phaser.Math.Between(0, config.width - 64);
    
    // 生成随机 y 坐标（确保矩形完全在画布内）
    const randomY = Phaser.Math.Between(0, config.height - 64);
    
    // 绘制 64x64 的粉色矩形
    graphics.fillRect(randomX, randomY, 64, 64);
  }
}

// 创建游戏实例
new Phaser.Game(config);