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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制星形（中心点在64,64，半径50）
  graphics.fillStar(64, 64, 5, 20, 50);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置速度为240（使用45度角方向，速度分量约为169.7）
  // 速度 = 240，分解为 x 和 y 分量
  const speed = 240;
  const angle = Math.PI / 4; // 45度角
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  
  star.setVelocity(vx, vy);
  
  // 启用世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置完全弹性碰撞（反弹系数为1）
  star.setBounce(1, 1);
  
  // 确保物理世界边界已设置
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);