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
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  
  // 生成纹理
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建物理精灵，位置在画布中心
  const circle = this.physics.add.sprite(400, 300, 'orangeCircle');
  
  // 设置初始速度为120（斜向移动）
  circle.setVelocity(120, 120);
  
  // 设置碰撞边界
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1，实现完美反弹
  circle.setBounce(1, 1);
  
  // 确保世界边界启用碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);
}

// 创建游戏实例
new Phaser.Game(config);