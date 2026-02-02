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
  
  // 绘制五角星（中心点在64,64，外半径50，内半径20）
  graphics.fillStar(64, 64, 5, 20, 50);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 128, 128);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置速度（240像素/秒，随机方向）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 240;
  const velocityY = Math.sin(angle) * 240;
  star.setVelocity(velocityX, velocityY);
  
  // 设置碰撞世界边界
  star.setCollideWorldBounds(true);
  
  // 设置完全反弹（弹性系数为1）
  star.setBounce(1, 1);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'Cyan star bouncing at 240 speed', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);