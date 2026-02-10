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
  // 使用 Graphics 绘制蓝色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  
  // 绘制星形（中心点在64,64，半径50）
  graphics.fillStar(64, 64, 5, 20, 50);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 128, 128);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置初始速度（使用勾股定理确保总速度约为160）
  // 160 = sqrt(vx^2 + vy^2)，这里使用 45度角
  const speed = 160;
  const angle = Phaser.Math.DegToRad(45); // 45度角
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  
  star.setVelocity(vx, vy);
  
  // 设置与世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'Blue star bouncing at 160 speed', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);