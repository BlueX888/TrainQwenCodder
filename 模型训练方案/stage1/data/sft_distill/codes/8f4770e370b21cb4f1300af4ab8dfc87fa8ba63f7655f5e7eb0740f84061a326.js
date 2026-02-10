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
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制五角星（中心点在64,64，半径为60）
  graphics.fillStar(64, 64, 5, 20, 60, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置速度（斜向移动以体现360的速度）
  // 使用勾股定理：sqrt(x^2 + y^2) = 360
  // 设置为45度角移动：x = y = 360 / sqrt(2) ≈ 254.56
  star.setVelocity(254.56, 254.56);
  
  // 启用世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 添加文字提示
  this.add.text(10, 10, 'Red star moving at 360 speed\nBouncing off canvas edges', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);