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
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的矩形
  graphics.generateTexture('yellowRect', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建物理精灵对象
  const rect = this.physics.add.sprite(400, 300, 'yellowRect');
  
  // 设置初始速度（斜向移动，速度为240）
  // 使用勾股定理：240 = sqrt(vx^2 + vy^2)
  // 简化为 45 度角移动：vx = vy = 240 / sqrt(2) ≈ 169.7
  const velocity = 240 / Math.sqrt(2);
  rect.setVelocity(velocity, velocity);
  
  // 启用世界边界碰撞
  rect.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  rect.setBounce(1, 1);
}

// 创建游戏实例
new Phaser.Game(config);