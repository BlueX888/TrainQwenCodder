const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  // 使用 Graphics 绘制黄色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillEllipse(50, 40, 100, 80); // 椭圆中心偏移，宽100高80
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 80);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 200);
  ellipse.setVelocity(velocity.x, velocity.y);
  
  // 启用椭圆的反弹属性
  ellipse.setBounce(1, 1); // x和y方向都完全反弹
  
  // 设置椭圆与世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 确保世界边界碰撞已启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

// 创建游戏实例
new Phaser.Game(config);