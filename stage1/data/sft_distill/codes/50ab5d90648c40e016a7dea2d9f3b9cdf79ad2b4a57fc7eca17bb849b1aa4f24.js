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
  backgroundColor: '#ffffff'
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(40, 40, 80, 80); // 在中心(40,40)绘制椭圆，宽高80
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 80);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置速度：总速度360，分解到x和y方向
  // 使用45度角：速度 = 360 / sqrt(2) ≈ 254.56
  const speed = 360 / Math.sqrt(2);
  ellipse.setVelocity(speed, speed);
  
  // 设置边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 可选：添加一些随机性，让运动更有趣
  // ellipse.setVelocity(
  //   Phaser.Math.Between(-360, 360),
  //   Phaser.Math.Between(-360, 360)
  // );
}

new Phaser.Game(config);