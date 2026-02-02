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
  // 使用 Graphics 绘制紫色星形
  const graphics = this.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9932cc, 1);
  
  // 绘制星形（中心点、外半径、内半径、星角数量）
  graphics.fillStar(50, 50, 5, 40, 20);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（速度分量的平方和开方约等于160）
  // 使用 45度角移动：速度 = 160 / √2 ≈ 113
  star.setVelocity(113, 113);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 启用世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 添加说明文字
  this.add.text(10, 10, '紫色星形以160速度移动，碰到边界会反弹', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);