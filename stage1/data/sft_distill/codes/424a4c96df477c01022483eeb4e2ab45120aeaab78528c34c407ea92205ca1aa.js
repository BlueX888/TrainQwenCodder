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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(50, 40, 100, 80); // 中心点(50,40)，宽100，高80
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 80);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（斜向移动，速度大约为200）
  // 使用勾股定理：sqrt(x^2 + y^2) ≈ 200
  // 使用 141.42 ≈ 200/sqrt(2)，使得合速度约为200
  ellipse.setVelocity(141.42, 141.42);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 启用世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 可选：添加文字提示
  this.add.text(10, 10, 'Gray ellipse bouncing at speed ~200', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);