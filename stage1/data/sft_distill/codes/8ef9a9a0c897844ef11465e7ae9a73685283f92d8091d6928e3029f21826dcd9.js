const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制椭圆 (中心点在 50, 30，宽度100，高度60)
  graphics.fillEllipse(50, 30, 100, 60);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 60);
  graphics.destroy();
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度 (200 速度，方向为右下)
  ellipse.setVelocity(200, 200);
  
  // 设置边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1 (完全弹性碰撞)
  ellipse.setBounce(1, 1);
}

// 启动游戏
new Phaser.Game(config);