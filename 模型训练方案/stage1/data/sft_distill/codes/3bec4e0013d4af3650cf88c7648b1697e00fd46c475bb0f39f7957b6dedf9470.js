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
  // 创建5个随机位置的粉色圆形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充 (0xff69b4 是粉色的十六进制值)
    graphics.fillStyle(0xff69b4, 1);
    
    // 绘制圆形，圆心在 (0, 0)，半径为 24 (直径48)
    graphics.fillCircle(0, 0, 24);
    
    // 设置随机位置
    // 考虑圆形半径，确保圆形完全在画布内
    const randomX = Phaser.Math.Between(24, 800 - 24);
    const randomY = Phaser.Math.Between(24, 600 - 24);
    graphics.setPosition(randomX, randomY);
  }
}

// 创建游戏实例
new Phaser.Game(config);