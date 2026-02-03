const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 无重力
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
  // 使用 Graphics 绘制白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);  // 白色
  graphics.fillEllipse(50, 40, 100, 80);  // 中心点(50,40)，宽100，高80
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 80);
  graphics.destroy();  // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（斜向移动，总速度约200）
  const angle = Phaser.Math.DegToRad(45);  // 45度角
  ellipse.setVelocity(
    Math.cos(angle) * 200,
    Math.sin(angle) * 200
  );
  
  // 启用世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 提示信息
  this.add.text(10, 10, 'White ellipse bouncing at 200 speed', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);