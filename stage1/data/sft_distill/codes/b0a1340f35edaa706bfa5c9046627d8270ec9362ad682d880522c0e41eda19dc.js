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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆
  
  // 生成纹理
  graphics.generateTexture('orangeEllipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'orangeEllipse');
  
  // 设置速度（360 像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 360);
  ellipse.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'Orange Ellipse bouncing at 360 speed', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

// 启动游戏
new Phaser.Game(config);