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
  // 使用 Graphics 绘制黄色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(32, 8);      // 顶点
  graphics.lineTo(8, 56);      // 左下角
  graphics.lineTo(56, 56);     // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建带物理属性的三角形精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（200像素/秒，方向为右下45度）
  triangle.setVelocity(200, 200);
  
  // 设置与世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：添加旋转效果使运动更生动
  triangle.setAngularVelocity(100);
}

new Phaser.Game(config);