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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制椭圆（中心点在 40, 30，宽度 80，高度 60）
  graphics.fillEllipse(40, 30, 80, 60);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（斜向移动，速度为 200）
  // 使用勾股定理：sqrt(vx^2 + vy^2) = 200
  // 设置为 45 度角：vx = vy = 200 / sqrt(2) ≈ 141.42
  ellipse.setVelocity(141.42, 141.42);
  
  // 设置碰撞世界边界
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
}

function update(time, delta) {
  // 不需要额外的更新逻辑，物理系统会自动处理移动和碰撞
}

new Phaser.Game(config);