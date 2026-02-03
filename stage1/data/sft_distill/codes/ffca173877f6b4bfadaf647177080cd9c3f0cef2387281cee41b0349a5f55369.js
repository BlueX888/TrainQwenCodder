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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制星形 (x, y, points, innerRadius, outerRadius)
  // 中心点设为 (40, 40)，5个角，内半径20，外半径40
  graphics.fillStar(40, 40, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('star', 80, 80);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（斜向移动，速度大约为240）
  // 使用勾股定理：sqrt(170^2 + 170^2) ≈ 240
  star.setVelocity(170, 170);
  
  // 设置完全反弹（弹性系数为1）
  star.setBounce(1, 1);
  
  // 启用与世界边界的碰撞
  star.setCollideWorldBounds(true);
  
  // 确保物理体大小与显示对象匹配
  star.body.setSize(80, 80);
}

new Phaser.Game(config);