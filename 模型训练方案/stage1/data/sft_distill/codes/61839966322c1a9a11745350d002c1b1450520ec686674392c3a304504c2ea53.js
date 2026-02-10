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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆 (中心x, 中心y, 宽度, 高度)
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置速度为 360 (斜向移动，使用勾股定理分解速度)
  const speed = 360;
  const angle = Math.PI / 4; // 45度角
  ellipse.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 启用世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1 (完全弹性碰撞)
  ellipse.setBounce(1, 1);
}

new Phaser.Game(config);