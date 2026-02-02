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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径25的圆
  
  // 生成纹理
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'redCircle');
  
  // 设置圆形为圆形碰撞体（更精确的碰撞检测）
  circle.setCircle(25);
  
  // 设置初始速度（斜向移动，速度大小约为300）
  // 使用勾股定理：sqrt(212^2 + 212^2) ≈ 300
  circle.setVelocity(212, 212);
  
  // 设置反弹系数为1（完全弹性碰撞）
  circle.setBounce(1, 1);
  
  // 启用世界边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'Red circle bouncing at speed ~300', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);