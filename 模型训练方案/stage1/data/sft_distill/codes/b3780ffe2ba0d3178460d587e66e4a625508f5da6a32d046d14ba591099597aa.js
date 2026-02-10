const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 无重力，保持匀速运动
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
  // 使用 Graphics 绘制橙色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1);  // 橙色
  
  // 绘制星形（中心点在 50, 50，半径 50）
  graphics.fillStar(50, 50, 5, 20, 50);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();  // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（斜向移动，速度分量使用勾股定理计算）
  // 总速度 360，分解为 x 和 y 方向
  const angle = Phaser.Math.DegToRad(45);  // 45度角
  const velocityX = Math.cos(angle) * 360;
  const velocityY = Math.sin(angle) * 360;
  star.setVelocity(velocityX, velocityY);
  
  // 设置碰撞世界边界
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞，不损失速度）
  star.setBounce(1, 1);
}

// 启动游戏
new Phaser.Game(config);