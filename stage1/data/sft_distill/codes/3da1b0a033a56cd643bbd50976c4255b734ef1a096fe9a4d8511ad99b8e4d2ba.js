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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillEllipse(50, 50, 100, 60); // 中心点(50,50)，宽100，高60
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（200像素/秒，斜向移动）
  ellipse.setVelocity(200, 200);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 启用世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'Orange ellipse bouncing at 200 speed', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);