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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制星形（中心点在64,64，半径50）
  graphics.fillStar(64, 64, 5, 20, 50);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 128, 128);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置初始速度（240速度，随机角度）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 240;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 240;
  star.body.setVelocity(velocityX, velocityY);
  
  // 设置世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 可选：添加旋转效果使星形更生动
  star.setAngularVelocity(100);
}

new Phaser.Game(config);