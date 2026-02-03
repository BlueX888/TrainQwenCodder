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
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  
  // 生成纹理
  graphics.generateTexture('grayCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'grayCircle');
  
  // 设置速度 - 使用勾股定理使合速度约为 360
  // 360 / sqrt(2) ≈ 254.56，这样 x 和 y 方向速度合成后约为 360
  const speed = 360 / Math.sqrt(2);
  circle.setVelocity(speed, speed);
  
  // 设置圆形碰撞体（更精确的碰撞检测）
  circle.body.setCircle(25);
  
  // 启用世界边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  circle.setBounce(1, 1);
}

function update(time, delta) {
  // 本例中无需额外更新逻辑，物理系统自动处理
}

new Phaser.Game(config);