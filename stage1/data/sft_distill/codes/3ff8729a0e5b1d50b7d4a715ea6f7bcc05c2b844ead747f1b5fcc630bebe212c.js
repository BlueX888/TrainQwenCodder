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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillEllipse(50, 40, 100, 80); // 中心点(50,40)，宽100，高80
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 80);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 200;
  const velocityY = Math.sin(angle * Math.PI / 180) * 200;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞和反弹
  ellipse.setCollideWorldBounds(true); // 启用世界边界碰撞
  ellipse.setBounce(1, 1); // 设置反弹系数为1（完全弹性碰撞）
}

function update(time, delta) {
  // 椭圆会自动由物理系统更新位置和处理碰撞
}

new Phaser.Game(config);