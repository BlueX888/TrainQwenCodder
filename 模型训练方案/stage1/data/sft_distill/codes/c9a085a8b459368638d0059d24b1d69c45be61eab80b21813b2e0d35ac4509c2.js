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
  // 使用 Graphics 创建橙色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  graphics.generateTexture('orangeEllipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'orangeEllipse');
  
  // 设置速度为 360（斜向移动，速度矢量长度为360）
  const angle = Phaser.Math.DegToRad(45); // 45度角
  const velocityX = Math.cos(angle) * 360;
  const velocityY = Math.sin(angle) * 360;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'Orange Ellipse bouncing at 360 speed', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);