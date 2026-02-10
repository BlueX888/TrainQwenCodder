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
  // 使用 Graphics 绘制蓝色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径为25的圆
  
  // 生成纹理
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'blueCircle');
  
  // 设置圆形为圆形碰撞体（更精确的碰撞检测）
  circle.setCircle(25);
  
  // 设置初始速度（斜向移动，速度约为300）
  // 使用勾股定理：sqrt(212^2 + 212^2) ≈ 300
  circle.setVelocity(212, 212);
  
  // 设置反弹系数为1（完全弹性碰撞）
  circle.setBounce(1, 1);
  
  // 启用世界边界碰撞
  circle.setCollideWorldBounds(true);
}

new Phaser.Game(config);