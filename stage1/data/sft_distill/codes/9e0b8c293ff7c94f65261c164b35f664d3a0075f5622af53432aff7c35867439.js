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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 绘制星形（中心点在 50, 50，半径 40）
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（速度大小为 360，斜向移动）
  // 使用勾股定理：360 = sqrt(vx^2 + vy^2)
  // 45度角：vx = vy = 360 / sqrt(2) ≈ 254.56
  const velocity = 360 / Math.sqrt(2);
  star.setVelocity(velocity, velocity);
  
  // 设置碰撞世界边界
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'Orange star bouncing at speed 360', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

new Phaser.Game(config);