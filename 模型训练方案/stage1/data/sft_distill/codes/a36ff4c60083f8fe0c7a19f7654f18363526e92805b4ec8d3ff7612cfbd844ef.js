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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  
  // 绘制星形（中心点在 50, 50，半径 50）
  graphics.fillStar(50, 50, 5, 20, 50);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置初始速度（160 像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 160;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 160;
  star.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 添加提示文本
  this.add.text(10, 10, 'Blue star bouncing at 160 speed', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);