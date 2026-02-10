const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 无重力，保持匀速运动
      debug: false
    }
  },
  scene: { preload, create, update }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);  // 红色
  graphics.fillCircle(25, 25, 25);  // 圆心在 (25, 25)，半径 25
  
  // 生成纹理
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();  // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'redCircle');
  
  // 设置速度（随机方向，速度为 300）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 300);
  circle.setVelocity(velocity.x, velocity.y);
  
  // 设置碰撞世界边界
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  circle.setBounce(1, 1);
}

function update(time, delta) {
  // 不需要额外的更新逻辑，物理系统会自动处理
}

new Phaser.Game(config);