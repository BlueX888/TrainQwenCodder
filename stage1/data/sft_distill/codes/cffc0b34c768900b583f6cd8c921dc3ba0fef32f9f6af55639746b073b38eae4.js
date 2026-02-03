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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(50, 50, 100, 60); // 在中心(50,50)绘制椭圆，宽100高60
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度 (240速度，可以是任意方向，这里设置为斜向移动)
  ellipse.setVelocity(240 * Math.cos(Math.PI / 4), 240 * Math.sin(Math.PI / 4));
  
  // 设置边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1，实现完美反弹
  ellipse.setBounce(1, 1);
}

// 启动游戏
new Phaser.Game(config);